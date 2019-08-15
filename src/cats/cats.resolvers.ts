
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import {
  Address,
  AddressInput,
  AddressQueryInput,
  AddressUpdateInput,
  Cat,
  PersonInput} from './graphql.schema';
import { CatsGuard } from './cats.guard';
import { AddressRepoService } from './services/address-repo.service';
import { CatRepoService } from './services/cats-repo.service';
import { OwnerRepoService } from './services/owner-repo.service';
import { CreateCatDto } from './dto/create-cat.dto';

const pubSub = new PubSub();

@Resolver('Cat')
export class CatsResolvers {
  constructor(private readonly catsService: CatRepoService,
              private readonly addressService: AddressRepoService,
              private readonly ownerService: OwnerRepoService) {
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
    personImput?: PersonInput
  ): Promise<Owner> {
    if (!personImput) {
      return await this.ownerService.findAll();
    } else {
      
      return await this.ownerService.findPeopleByList()
    }
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
