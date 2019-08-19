
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

  buildCat(id: string): Cat {
    const c = this.catsService.findOneByIdSync(id);
    return {
      id: c.id,
      name: c.name,
      age: c.age,
      breed: c.breed,
      owners: this.ownerRangeService.findAllRangesByCatThatAreOwnerSync(c.id)
        .map(cor => this.buildCatOwnerRange(cor.id))
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

  buildPetSanctuaryNHistory(id: string): PetSanctuaryNHistory {
    const p = this.sanctuaryService.findOneByIdSync(id);
    return {
      id: p.id,
      name: p.name,
      address: this.addressService.findOneByIdSync(p.addressId)
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

  buildOwner(id: string): Owner {
    const o = this.ownerService.findOneByIdSync(id);
    const retval: Owner = {
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
        cats: this.ownerRangeService.findAllRangesByOwnerSync(o.id)
          .map(cor => this.buildCat(cor.catId))
    };
    return retval;
  }

  constructor(private readonly addressService: AddressRepoService,
              private readonly catsService: CatRepoService,
              private readonly ownerService: OwnerRepoService,
              private readonly ownerRangeService: OwnerRangeRepoService,
              private readonly personAddressService: PersonAddressRepoService,
              private readonly sanctuaryService: SanctuaryRepoService) {
  }
}
