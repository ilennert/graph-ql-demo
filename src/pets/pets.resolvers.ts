
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Address,
  AddressInput,
  AddressQueryInput,
  AddressUpdateInput,
  Pet,
  PetInput,
  CreateOwnerInput,
  CreatePetSanctuaryInput,
  Owner,
  Person,
  PersonInput,
  PersonQueryInput,
  PetSanctuary,
  PetSanctuaryInput,
  TransferPetInput,
  Species,
  SpeciesInput
} from './graphql.schema';
import { PetsGuard } from './pets.guard';
import { AddressRepoService } from './services/address-repo.service';
import { PetRepoService } from './services/pets-repo.service';
import { MappingService } from './helpers/mapping.service';
import { OwnerRangeRepoService } from './services/pet-owner-range-repo.service';
import { OwnerRepoService } from './services/owner-repo.service';
import { PersonAddressRepoService } from './services/person-address-repo.service';
import { SanctuaryRepoService } from './services/sanctuary-repo.service';
import { SpeciesRepoService } from './services/species-repo.service';
import { PetOwnerRangeItem, initPetOwnerRange } from './model/pet-owner-range.model';
import { PetRecord } from './dto/pet-record';

const pubSub = new PubSub();

@Resolver('Pet')
export class PetsResolvers {
  constructor(private readonly petsService: PetRepoService,
              private readonly addressService: AddressRepoService,
              private readonly mappingService: MappingService,
              private readonly ownerService: OwnerRepoService,
              private readonly ownerRangeService: OwnerRangeRepoService,
              private readonly personAddressService: PersonAddressRepoService,
              private readonly sanctuaryService: SanctuaryRepoService,
              private readonly speciesService: SpeciesRepoService) {
  }

  @Query()
  @UseGuards(PetsGuard)
  async pets() {
    return await this.petsService.findAll().pipe(
      map(ca => ca.map(c => this.mappingService.buildPet(c.id)))
    ).toPromise();
  }

  @Query('pet')
  async findOneById(
    @Args('id')
    id: string
  ): Promise<Pet> {
    return await this.petsService.findOneById(id).pipe(
      map(c => this.mappingService.buildPet(c.id))
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
    personInput?: PersonQueryInput
  ): Promise<Owner[]> {
    if (!personInput) {
      return await this.ownerService.findAll().pipe(
        map(pa => pa.map(p => this.mappingService.buildOwner(p.id)))
      ).toPromise();
    } else {
      let peopleList: string[];
      if (personInput.addresses) {
        peopleList = this.ownerService.findByAddressValueSync(personInput);
        peopleList = peopleList && peopleList.length === 0 ? undefined : peopleList;
      }
      return await this.ownerService.findPeopleByList(
        this.ownerService.findPeopleFromListAndInputSync(peopleList, personInput)
        ).pipe(map(pa => pa.map(p => this.mappingService.buildOwner(p.id)))).toPromise();
    }
  }

  @Query('person')
  async person(@Args('id') id: string): Promise<Owner> {
    return await this.ownerService.findOneById(id).pipe(
      map(p => this.mappingService.buildOwner(p.id))).toPromise();
  }

  @Query('petSanctuaries')
  async petSanctuaries(): Promise<PetSanctuary[]> {
    return await this.sanctuaryService.findAll().pipe(
      map(sa => sa.map(s => this.mappingService.buildPetSanctuaryObj(s)))).toPromise();
  }

  @Query('species')
  async species(
    @Args('speciesInput')
    speciesInput?: SpeciesInput
  ): Promise<Species[]> {
    return await this.speciesService.findAnyByInput(speciesInput).toPromise();
  }

  @Mutation('createPet')
  async create(@Args('petInput') args: PetInput): Promise<Pet> {
    const createdPet = await this.petsService.create(args).pipe(map(c =>
      this.mappingService.buildPet(c.id))).toPromise();
    pubSub.publish('petCreated', { petCreated: createdPet });
    return createdPet;
  }

  @Mutation('removePet')
  async remove(@Args('id') id: string): Promise<Pet> {
    const removedPet = await this.petsService.remove(id).pipe(
      map(c => this.mappingService.buildPet(c.id))
    ).toPromise();
    pubSub.publish('removedPet', { petRemoved: removedPet });
    return removedPet;
  }

  @Mutation('updatePet')
  async update(@Args('id') id: string, @Args('updatePetInput') updateFields: Partial<Pet>): Promise<Pet> {
    const updatedPet = await this.petsService.update(id, updateFields).pipe(
      map(c => this.mappingService.buildPet(c.id))
    ).toPromise();
    pubSub.publish('updatedPet', { petUpdated: updatedPet });
    return updatedPet;
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

  @Mutation('createPetOwner')
  async createPetOwner(
    @Args('createOwnerInput') createOwnerInput: CreateOwnerInput
  ): Promise<Owner> {
    const person = this.ownerService.findOneByIdSync(createOwnerInput.ownerId);
    const now = new Date();
    createOwnerInput.pets.map(cid => {
        const range: PetOwnerRangeItem = {
            ...initPetOwnerRange,
            ownerId: person.id,
            petId: cid.id,
            sanctuaryId: createOwnerInput.sanctuaryId,
            start: new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
        };
        this.ownerRangeService.createSync(range);
    });
    return await of(this.mappingService.buildOwner(person.id)).toPromise();
  }

  @Mutation('createPersonAddress')
  async createPersonAddress(
    @Args('personId') personId: string,
    @Args('addressId') addressId: string
  ): Promise<Owner> {
    return await  this.personAddressService.create(personId, addressId)
      .pipe(map(pa => this.mappingService.buildOwner(pa.personId))).toPromise();
  }

  @Mutation('removePersonAddress')
  async removePersonAddress(
    @Args('personId') personId: string,
    @Args('addressId') addressId: string
  ): Promise<Owner> {
    return await this.personAddressService.remove(personId, addressId)
      .pipe(map(pa => this.mappingService.buildOwner(pa.personId))).toPromise();
  }

  @Mutation('createPetSanctuary')
  async createPetSanctuary(
    @Args('createPetSanctuaryInput') createPetSanctuaryInput: CreatePetSanctuaryInput
  ): Promise<PetSanctuary> {
    return await this.sanctuaryService.create(createPetSanctuaryInput).pipe(
      map(s => {
        const sanctuary: PetSanctuary = {
          id: s.id,
          name: s.name,
          address: this.addressService.findOneByIdSync(s.addressId),
          petInventory: this.ownerRangeService.findAllRangesBySanctuarySync(s.id).map(cor => {
            return this.mappingService.buildPet(cor.petId);
          })
        };
        return sanctuary;
      })
    ).toPromise();
  }

  @Mutation('createPetSanctuaryFull')
  async createPetSanctuaryFull(
    @Args('createPetSanctuaryInput') petSanctuaryInput: PetSanctuaryInput
  ): Promise<PetSanctuary> {
    return await this.sanctuaryService.createFull(petSanctuaryInput).pipe(
      map(s => {
        const sanctuary: PetSanctuary = {
          id: s.id,
          name: s.name,
          address: this.addressService.findOneByIdSync(s.addressId),
          petInventory: this.ownerRangeService.findAllRangesBySanctuarySync(s.id).map(cor => {
            return this.mappingService.buildPet(cor.petId);
          })
        };
        return sanctuary;
      })
    ).toPromise();
  }

  @Mutation('changePetOwnership')
  async changePetOwnership(
    @Args('transferPetInput') transferPetInput: TransferPetInput
  ): Promise<PetSanctuary> {
    const now = new Date();
    const range: PetOwnerRangeItem = {
      ...initPetOwnerRange,
      toOwner: transferPetInput.toOwner,
      ownerId: transferPetInput.ownerId,
      petId: transferPetInput.petId,
      sanctuaryId: transferPetInput.sanctuaryId,
      start: new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    };
    const sanctuary = await this.ownerRangeService.create(range).pipe(
      map(ri => this.mappingService.buildPetSanctuary(ri.sanctuaryId))
    ).toPromise();
    pubSub.publish('petOwnershipChanged', { petOwnershipChanged: range });
    return sanctuary;
  }

  @Mutation('createSpecies')
  async createSpecies(
    @Args('speciesInput') speciesInput: SpeciesInput
  ): Promise<Species> {
    const createSpecies = await this.speciesService.create(speciesInput).toPromise();
    return createSpecies;
  }

  @Subscription('petCreated')
  petCreated() {
    return pubSub.asyncIterator('petCreated');
  }

  @Subscription('petRemoved')
  petRemoved() {
    return pubSub.asyncIterator('petRemoved');
  }

  @Subscription('petUpdated')
  petUpdated() {
    return pubSub.asyncIterator('petUpdated');
  }

  @Subscription('petOwnershipChanged')
  petOwnershipChanged() {
    return pubSub.asyncIterator('petOwnershipChanged');
  }
}
