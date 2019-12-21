
import { Injectable } from '@nestjs/common';

import {
  Address,
  Pet,
  PetNHistory,
  PetOwnerRange,
  Owner,
  OwnerNHistory,
  PetSanctuary,
  PetSanctuaryNHistory} from '../graphql.schema';
import { AddressRepoService } from '../services/address-repo.service';
import { PetRepoService } from '../services/pets-repo.service';
import { OwnerPetRepoService } from '../services/owner-pet-repo.service';
import { OwnerRepoService } from '../services/owner-repo.service';
import { OwnerRangeRepoService } from '../services/pet-owner-range-repo.service';
import { PersonAddressRepoService } from '../services/person-address-repo.service';
import { SanctuaryPetRepoService } from '../services/sanctuary-pet-repo.service';
import { SanctuaryRepoService } from '../services/sanctuary-repo.service';
import { PetItem } from '../model/pet.model';
import { PetOwnerRangeItem } from '../model/pet-owner-range.model';
import { PersonItem } from '../model/person.model';
import { SanctuaryModel } from '../model';
import { SpeciesRepoService } from '../services/species-repo.service';

@Injectable()
export class MappingService {

  buildPetNHistory(id: string): PetNHistory {
    const c = this.petsService.findOneByIdSync(id);
    return {
      id: c.id,
      name: c.name,
      age: c.age,
      breed: c.breed
    };
  }

  buildPetNHistoryObj(item: PetItem): PetNHistory {
    return {
      id: item.id,
      name: item.name,
      age: item.age,
      breed: item.breed
    };
  }

  buildPet(id: string): Pet {
    const c = this.petsService.findOneByIdSync(id);
    return {
      id: c.id,
      name: c.name,
      age: c.age,
      breed: c.breed,
      species: this.speciesService.findOneByIdSync(c.speciesId).name,
      owners: this.ownerRangeService.findAllRangesByPetSync(c.id)
        .map(por => this.buildPetOwnerRangeObj(por))
    };
  }

  buildPetObj(item: PetItem): Pet {
    return {
      id: item.id,
      name: item.name,
      age: item.age,
      breed: item.breed,
      species: this.speciesService.findOneByIdSync(item.speciesId).name,
      owners: this.ownerRangeService.findAllRangesByPetSync(item.id)
      .map(por => this.buildPetOwnerRangeObj(por))
    };
  }

  buildOwnerNHistory(id: string): OwnerNHistory {
    const o = this.ownerService.findOneByIdSync(id);
    return {
      id: o.id,
      name: o.name,
      addresses: this.personAddressService.findAllByPersonIdsSync(o.id)
      .map(pa => {
        const a = this.addressService.findOneByIdSync(pa.addressId);
        return {
          id: a.id,
          street: a.street,
          city: a.city,
          stateProv: a.stateProv,
          zipPostal: a.zipPostal
        };
      }),
      birthdate: o.birthdate
    };
  }

  buildOwnerNHistoryObj(person: PersonItem): OwnerNHistory {
    return {
      id: person.id,
      name: person.name,
      addresses: this.personAddressService.findAllByPersonIdsSync(person.id)
      .map(pa => {
        const a = this.addressService.findOneByIdSync(pa.addressId);
        return {
          id: a.id,
          street: a.street,
          city: a.city,
          stateProv: a.stateProv,
          zipPostal: a.zipPostal
        };
      }),
      birthdate: person.birthdate
    };
  }

  buildOwnerNHistoryObj2(person: PersonItem, aa: Address[]): OwnerNHistory {
    return {
      id: person.id,
      name: person.name,
      addresses: aa,
      birthdate: person.birthdate
    };
  }

  buildPetSanctuaryNHistory(id: string): PetSanctuaryNHistory {
    const p = this.sanctuaryService.findOneByIdSync(id);
    return {
      id: p.id,
      name: p.name,
      address: this.addressService.findOneByIdSync(p.addressId)
    };
  }

  buildPetSanctuaryNHistoryObj(p: SanctuaryModel): PetSanctuaryNHistory {
    return {
      id: p.id,
      name: p.name,
      address: this.addressService.findOneByIdSync(p.addressId)
    };
  }

  buildPetSanctuaryNHistoryObj2(p: SanctuaryModel, a: Address): PetSanctuaryNHistory {
    return {
      id: p.id,
      name: p.name,
      address: a
    };
  }

  buildPetSanctuary(id: string): PetSanctuary {
    const p = this.sanctuaryService.findOneByIdSync(id);
    return {
      id: p.id,
      name: p.name,
      address: this.addressService.findOneByIdSync(p.addressId),
      petInventory: this.sanctuaryPetService.findAllBySanctuaryIdsSync(p.id).map(cor => {
        return this.buildPet(cor.petId);
      })
    };
  }

  buildPetSanctuaryObj(p: SanctuaryModel): PetSanctuary {
    return {
      id: p.id,
      name: p.name,
      address: this.addressService.findOneByIdSync(p.addressId),
      petInventory: this.sanctuaryPetService.findAllBySanctuaryIdsSync(p.id).map(cor => {
        return this.buildPet(cor.petId);
      })
    };
  }

  buildPetOwnerRange(id: string): PetOwnerRange {
    const r = this.ownerRangeService.findOneByIdSync(id);
    return {
      id: r.id,
      pet: this.buildPetNHistory(r.petId),
      owner: r.ownerId ? this.buildOwnerNHistory(r.ownerId) : undefined,
      sanctuary: r.sanctuaryId ? this.buildPetSanctuaryNHistory(r.sanctuaryId) : undefined,
      toOwner: r.toOwner,
      transactionDate: r.transactionDate
    };
  }

  buildPetOwnerRangeObj(item: PetOwnerRangeItem): PetOwnerRange {
    return {
      id: item.id,
      pet: this.buildPetNHistory(item.petId),
      owner: item.ownerId ? this.buildOwnerNHistory(item.ownerId) : undefined,
      sanctuary: item.sanctuaryId ? this.buildPetSanctuaryNHistory(item.sanctuaryId) : undefined,
      toOwner: item.toOwner,
      transactionDate: item.transactionDate
    };
  }

  buildAddressesFromPerson(pi: PersonItem): Address[] {
    return this.personAddressService.findAllByPersonIdsSync(pi.id)
        .map(pa => this.addressService.findOneByIdSync(pa.addressId));
  }

  buildOwner(id: string): Owner {
    const o = this.ownerService.findOneByIdSync(id);
    const retval: Owner = {
      id: o.id,
      name: o.name,
      addresses: this.buildAddressesFromPerson(o),
      pets: this.ownerPetService.findAllByPersonIdsSync(o.id)
        .map(cor => this.buildPet(cor.petId))
    };
    return retval;
  }

  buildOwnerObj(pi: PersonItem): Owner {
    return {
      id: pi.id,
      name: pi.name,
      addresses: this.buildAddressesFromPerson(pi),
      pets: this.ownerPetService.findAllByPersonIdsSync(pi.id)
        .map(cor => this.buildPet(cor.petId))
    };
  }

  constructor(private readonly addressService: AddressRepoService,
              private readonly petsService: PetRepoService,
              private readonly ownerPetService: OwnerPetRepoService,
              private readonly ownerService: OwnerRepoService,
              private readonly ownerRangeService: OwnerRangeRepoService,
              private readonly personAddressService: PersonAddressRepoService,
              private readonly sanctuaryPetService: SanctuaryPetRepoService,
              private readonly sanctuaryService: SanctuaryRepoService,
              private readonly speciesService: SpeciesRepoService) {
  }
}
