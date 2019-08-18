
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
              private readonly ownerService: OwnerRepoService,
              private readonly ownerRangeService: OwnerRangeRepoService,
              private readonly personAddressService: PersonAddressRepoService,
              private readonly sanctuaryService: SanctuaryRepoService) {
  }

  @Query()
  @UseGuards(CatsGuard)
  async cats() {
    return await this.catsService.findAll().toPromise();
  }

  @Query('cat')
  async findOneById(
    @Args('id')
    id: string
  ): Promise<Cat> {
    return await this.catsService.findOneById(id).toPromise();
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
      return await this.ownerService.findAll().toPromise();
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
    const removedCat = await this.catsService.remove(id).toPromise();
    pubSub.publish('removedCat', { catRemoved: removedCat });
    return removedCat;
  }

  @Mutation('updateCat')
  async update(@Args('id') id: string, @Args('updateCatInput') updateFields: Partial<Cat>): Promise<Cat> {
    const updatedCat = await this.catsService.update(id, updateFields).toPromise();
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
            const retval: CatOwnerRange = {
              id: cor.id,
              cat: this.buildCatNHistory(cor.catId),
              owner: cor.ownerId ? this.buildOwnerNHistory(cor.ownerId) : undefined,
              sanctuary: cor.sanctuaryId ? this.buildPetSanctuaryNHistory(cor.sanctuaryId) : undefined,
              start: cor.start,
              end: cor.end
            };
            return retval;
          })
        };
        return sanctuary
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

  private buildCatNHistory(id: string): CatNHistory {
    const c = this.catsService.findOneByIdSync(id);
    return {
      id: c.id,
      name: c.name,
      age: c.age,
      breed: c.breed
    };
  }

  private buildCat(id: string): Cat {
    const c = this.catsService.findOneByIdSync(id);
    return {
      id: c.id,
      name: c.name,
      age: c.age,
      breed: c.breed,
      owners: this.ownerRangeService.findAllRangesByOwnerSync(c.id)
    };
  }

  private buildOwnerNHistory(id: string): OwnerNHistory {
    const o = this.ownerService.findOneByIdSync(id);
    return {
      id: o.id,
      name: o.name,
      address: o.address,
      birthdate: o.birthdate
    };
  }

  private buildPetSanctuaryNHistory(id: string): PetSanctuaryNHistory {
    const p = this.sanctuaryService.findOneByIdSync(id);
    return {
      id: p.id,
      name: p.name,
      address: this.addressService.findOneByIdSync(p.addressId)
    };
  }
}
