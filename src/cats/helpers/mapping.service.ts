
import { Injectable } from '@nestjs/common';

import {
  Address,
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
  PetSanctuaryNHistory} from '../graphql.schema';
import { AddressRepoService } from '../services/address-repo.service';
import { CatRepoService } from '../services/cats-repo.service';
import { OwnerRepoService } from '../services/owner-repo.service';
import { OwnerRangeRepoService } from '../services/cat-owner-range-repo.service';
import { PersonAddressRepoService } from '../services/person-address-repo.service';
import { SanctuaryRepoService } from '../services/sanctuary-repo.service';
import { CatItem } from '../model/cat.model';
import { CatOwnerRangeItem } from '../model/cat-owner-range.model';
import { PersonItem } from '../model/person.model';
import { SanctuaryModel } from '../model';

@Injectable()
export class MappingService {

  buildCatNHistory(id: string): CatNHistory {
    const c = this.catsService.findOneByIdSync(id);
    return {
      id: c.id,
      name: c.name,
      age: c.age,
      breed: c.breed
    };
  }

  buildCatNHistoryObj(item: CatItem): CatNHistory {
    return {
      id: item.id,
      name: item.name,
      age: item.age,
      breed: item.breed
    };
  }

  buildCat(id: string): Cat {
    const c = this.catsService.findOneByIdSync(id);
    return {
      id: c.id,
      name: c.name,
      age: c.age,
      breed: c.breed,
      owners: this.ownerRangeService.findAllRangesByCatThatAreOwnerSync(c.id)
        .map(cor => this.buildCatOwnerRangeObj(cor))
    };
  }

  buildCatObj(item: CatItem): Cat {
    return {
      id: item.id,
      name: item.name,
      age: item.age,
      breed: item.breed,
      owners: this.ownerRangeService.findAllRangesByCatThatAreOwnerSync(item.id)
      .map(cor => this.buildCatOwnerRangeObj(cor))
    };
  }

  buildOwnerNHistory(id: string): OwnerNHistory {
    const o = this.ownerService.findOneByIdSync(id);
    return {
      id: o.id,
      name: o.name,
      address: this.personAddressService.findAllByPersonIdsSync(o.id)
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
      address: this.personAddressService.findAllByPersonIdsSync(person.id)
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
      address: aa,
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
      catInventory: this.ownerRangeService.findAllRangesBySanctuarySync(p.id).map(cor => {
        return this.buildCat(cor.catId);
      })
    };
  }

  buildPetSanctuaryObj(p: SanctuaryModel): PetSanctuary {
    return {
      id: p.id,
      name: p.name,
      address: this.addressService.findOneByIdSync(p.addressId),
      catInventory: this.ownerRangeService.findAllRangesBySanctuarySync(p.id).map(cor => {
        return this.buildCat(cor.catId);
      })
    };
  }

buildCatOwnerRange(id: string): CatOwnerRange {
    const r = this.ownerRangeService.findOneByIdSync(id);
    return {
      id: r.id,
      cat: this.buildCatNHistory(r.catId),
      owner: r.ownerId ? this.buildOwnerNHistory(r.ownerId) : undefined,
      sanctuary: r.sanctuaryId ? this.buildPetSanctuaryNHistory(r.sanctuaryId) : undefined,
      start: r.start,
      end: r.end
    };
  }

  buildCatOwnerRangeObj(item: CatOwnerRangeItem): CatOwnerRange {
    return {
      id: item.id,
      cat: this.buildCatNHistory(item.catId),
      owner: item.ownerId ? this.buildOwnerNHistory(item.ownerId) : undefined,
      sanctuary: item.sanctuaryId ? this.buildPetSanctuaryNHistory(item.sanctuaryId) : undefined,
      start: item.start,
      end: item.end
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
      address: this.buildAddressesFromPerson(o),
      cats: this.ownerRangeService.findAllRangesByOwnerSync(o.id)
        .map(cor => this.buildCat(cor.catId))
    };
    return retval;
  }

  buildOwnerObj(pi: PersonItem): Owner {
    return {
      id: pi.id,
      name: pi.name,
      address: this.buildAddressesFromPerson(pi),
      cats: this.ownerRangeService.findAllRangesByOwnerSync(pi.id)
        .map(cor => this.buildCat(cor.catId))
    };
  }

  constructor(private readonly addressService: AddressRepoService,
              private readonly catsService: CatRepoService,
              private readonly ownerService: OwnerRepoService,
              private readonly ownerRangeService: OwnerRangeRepoService,
              private readonly personAddressService: PersonAddressRepoService,
              private readonly sanctuaryService: SanctuaryRepoService) {
  }
}
