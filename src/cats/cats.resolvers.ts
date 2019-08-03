
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { Cat } from './graphql.schema';
import { CatsGuard } from './cats.guard';
import { CatsRepoService } from './services';
import { CreateCatDto } from './dto/create-cat.dto';

const pubSub = new PubSub();

@Resolver('Cat')
export class CatsResolvers {
  constructor(private readonly catsService: CatsRepoService) {
  }

  @Query()
  @UseGuards(CatsGuard)
  async getCats() {
    return await this.catsService.findAll().toPromise();
  }

  @Query('cat')
  async findOneById(
    @Args('id')
    id: string
  ): Promise<Cat> {
    return await this.catsService.findOneById(id).toPromise();
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
