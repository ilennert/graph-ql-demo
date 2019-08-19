
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { map } from 'rxjs/operators';

import {
  Address,
  AddressInput,
  AddressQueryInput,
  AddressUpdateInput,
  Cat,
  CatNHistory,
  CatOwnerRange,
  CreateCatInput,
  CreateOwnerInput,
  CreatePetSanctuaryInput,
  Owner,
  OwnerNHistory,
  Person,
  PersonInput,
  PetSanctuary,
  PetSanctuaryNHistory} from './graphql.schema';
import { CatsGuard } from './cats.guard';
import { AddressRepoService } from './services/address-repo.service';
import { CatRepoService } from './services/cats-repo.service';
import { MappingService } from './helpers/mapping.service';
import { OwnerRangeRepoService } from './services/cat-owner-range-repo.service';
import { OwnerRepoService } from './services/owner-repo.service';
import { PersonAddressRepoService } from './services/person-address-repo.service';
import { SanctuaryRepoService } from './services/sanctuary-repo.service';
import { CatOwnerRangeItem, initCatOwnerRange } from './model/cat-owner-range.model';
import { CatRecord } from './dto/cat-record';

const pubSub = new PubSub();

@Resolver('Cat')
export class CatsResolvers {
  constructor(private readonly catsService: CatRepoService,
              private readonly addressService: AddressRepoService,
              private readonly mappingService: MappingService,
              private readonly ownerService: OwnerRepoService,
              private readonly ownerRangeService: OwnerRangeRepoService,
              private readonly personAddressService: PersonAddressRepoService,
              private readonly sanctuaryService: SanctuaryRepoService) {
  }

  @Query()
  @UseGuards(CatsGuard)
  async cats() {
    return await this.catsService.findAll().pipe(
      map(ca => ca.map(c => this.mappingService.buildCat(c.id)))
    ).toPromise();
  }

  @Query('cat')
  async findOneById(
    @Args('id')
    id: string
  ): Promise<Cat> {
    return await this.catsService.findOneById(id).pipe(
      map(c => this.mappingService.buildCat(c.id))
    ).toPromise();
  }

  @Query('addresses')
  async addresses(
    @Args('queryInput')
    queryInput?: AddressQueryInput
  ): Promise<Address[]> {
    return await this.addressService.findAnyByInput(queryInput).toPromise();
  }

  @Query('people')
  async people(
    @Args('personInput')
    personInput?: PersonInput
  ): Promise<Owner[]> {
    if (!personInput) {
      return await this.ownerService.findAll().pipe(
        map(pa => pa.map(p => this.mappingService.buildOwner(p.id)))
      ).toPromise();
    } else {
      let addressLst: string[];
      let peopleList: string[];
      if (personInput.address) {
        addressLst = personInput.address.map(a => a.id);
        peopleList = this.ownerService.findByAddressIdsListSync(addressLst);
        peopleList = peopleList && peopleList.length === 0 ? undefined : peopleList;
      }
      return await this.ownerService.findPeopleByList(
        this.ownerService.findPeopleFromListAndInputSync(peopleList, personInput)
        ).toPromise();
    }
  }

  @Query('person')
  async person(@Args('id') id: string): Promise<Owner> {
    return await this.ownerService.findOneById(id).toPromise();
  }

  // @Mutation('createCat')
  // async create(@Args('createCatInput') args: CreateCatInput): Promise<Cat> {
  //   const createdCat = await this.catsService.create(args).toPromise();
  //   pubSub.publish('catCreated', { catCreated: createdCat });
  //   return createdCat;
  // }

  @Mutation('removeCat')
  async remove(@Args('id') id: string): Promise<Cat> {
    const removedCat = await this.catsService.remove(id).pipe(
      map(c => this.mappingService.buildCat(c.id))
    ).toPromise();
    pubSub.publish('removedCat', { catRemoved: removedCat });
    return removedCat;
  }

  @Mutation('updateCat')
  async update(@Args('id') id: string, @Args('updateCatInput') updateFields: Partial<Cat>): Promise<Cat> {
    const updatedCat = await this.catsService.update(id, updateFields).pipe(
      map(c => this.mappingService.buildCat(c.id))
    ).toPromise();
    pubSub.publish('updatedCat', { catUpdated: updatedCat });
    return updatedCat;
  }

  @Mutation('createAddress')
  async createAddress(@Args('addressInput') addressInput: AddressInput): Promise<Address> {
    const createAddress = await this.addressService.create(addressInput).toPromise();
    return createAddress;
  }

  @Mutation('removeAddress')
  async removeAddress(@Args('id') id: string): Promise<Address> {
    return await this.addressService.remove(id).toPromise();
  }

  @Mutation('updateAddress')
  async updateAddress(
    @Args('id') id: string,
    @Args('updateAddress') updateAddress: AddressUpdateInput
  ): Promise<Address> {
    return await this.addressService.update(id, updateAddress).toPromise();
  }

  @Mutation('createPerson')
  async createPerson(
    @Args('personInput') personInput: PersonInput
  ): Promise<Person> {
    return await this.ownerService.create(personInput).toPromise();
  }

  @Mutation('createCatOwner')
  async createCatOwner(
    @Args('createOwnerInput') createOwnerInput: CreateOwnerInput
  ): Promise<Owner> {
    return await this.ownerService.createCatOwner(createOwnerInput).toPromise();
  }

  @Mutation('createPersonAddress')
  async createPersonAddress(
    @Args('personId') personId: string,
    @Args('addressId') addressId: string
  ): Promise<Owner> {
    return await  this.personAddressService.create(personId, addressId)
      .pipe(map(pa => this.ownerService.findOneById(pa.personId).toPromise())).toPromise();
  }

  @Mutation('removePersonAddress')
  async removePersonAddress(
    @Args('personId') personId: string,
    @Args('addressId') addressId: string
  ): Promise<Owner> {
    return await this.personAddressService.remove(personId, addressId)
      .pipe(map(pa => this.ownerService.findOneById(pa.personId).toPromise())).toPromise();
  }

  @Mutation('createCatSanctuary')
  async createCatSanctuary(
    @Args('createPetSanctuaryInput') createPetSanctuaryInput: CreatePetSanctuaryInput
  ): Promise<PetSanctuary> {
    return await this.sanctuaryService.create(createPetSanctuaryInput).pipe(
      map(s => {
        const sanctuary: PetSanctuary = {
          id: s.id,
          name: s.name,
          address: this.addressService.findOneByIdSync(s.addressId),
          catInventory: this.ownerRangeService.findAllRangesBySanctuarySync(s.id).map(cor => {
            return this.mappingService.buildCat(cor.catId);
          })
        };
        return sanctuary;
      })
    ).toPromise();
  }

  @Subscription('catCreated')
  catCreated() {
    return pubSub.asyncIterator('catCreated');
  }

  @Subscription('catRemoved')
  catRemoved() {
    return pubSub.asyncIterator('catRemoved');
  }

  @Subscription('catUpdated')
  catUpdated() {
    return pubSub.asyncIterator('catUpdated');
  }

}
