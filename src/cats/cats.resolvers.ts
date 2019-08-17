
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
  CreateOwnerInput,
  Owner,
  Person,
  PersonInput} from './graphql.schema';
import { CatsGuard } from './cats.guard';
import { AddressRepoService } from './services/address-repo.service';
import { CatRepoService } from './services/cats-repo.service';
import { OwnerRepoService } from './services/owner-repo.service';
import { PersonAddressRepoService } from './services/person-address-repo.service';
import { CreateCatDto } from './dto/create-cat.dto';

const pubSub = new PubSub();

@Resolver('Cat')
export class CatsResolvers {
  constructor(private readonly catsService: CatRepoService,
              private readonly addressService: AddressRepoService,
              private readonly ownerService: OwnerRepoService,
              private readonly personAddressService: PersonAddressRepoService) {
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

  @Mutation('createCat')
  async create(@Args('createCatInput') args: CreateCatDto): Promise<Cat> {
    const createdCat = await this.catsService.create(args).toPromise();
    pubSub.publish('catCreated', { catCreated: createdCat });
    return createdCat;
  }

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
    const personAddress = this.personAddressService.createSync(personId, addressId);
    return await this.ownerService.findOneById(personAddress.personId).toPromise();
  }

  @Mutation('removePersonAddress')
  async removePersonAddress(
    @Args('personId') personId: string,
    @Args('addressId') addressId: string
  ): Promise<Owner> {
    return await this.personAddressService.remove(personId, addressId)
      .pipe(map(pa => {
        return this.ownerService.findOneById(pa.personId).toPromise();
      })).toPromise();
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
