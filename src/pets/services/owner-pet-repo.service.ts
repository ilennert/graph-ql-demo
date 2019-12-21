
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { TableManagementService } from './table-management.service';
// import { AddressRepoService } from './address-repo.service';
import { OwnerPet } from '../model/owner-pet.model';
// import { AddressQueryInput } from '../graphql.schema';
import { PetOwnerRangeItem } from '../model/pet-owner-range.model';

@Injectable()
export class OwnerPetRepoService {
    private ownerPet: OwnerPet[] = [];
    private channel: number;

    createSync(personId: string, petId: string): OwnerPet {
        if (this.ownerPet.find(pa => pa.personId === personId &&
            pa.petId === petId)) {
                throw new Error('Can not duplicate a OwnerPet');
        }
        const ownerPet: OwnerPet = {
            personId,
            petId
        };
        this.ownerPet = [ ...this.ownerPet, ownerPet ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.ownerPet);

        return ownerPet;
    }

    create(personId: string, petId: string): Observable<OwnerPet> {
        return of(this.createSync(personId, petId));
    }

    rulesCheck(period: PetOwnerRangeItem): void {
        // here we will ignore, create or remove
        if (period.ownerId && period.toOwner) {
            this.createSync(period.ownerId, period.petId);
        } else if (period.ownerId && !period.toOwner) {
            this.removeSync(period.ownerId, period.petId);
        }
    }

    removeSync(personId: string, petId: string): OwnerPet {
        const personAddress = this.ownerPet.find(pa => pa.personId === personId && pa.petId === petId);
        if (!personAddress) {
            throw new Error('PersonAddress not found');
        }
        this.ownerPet = this.ownerPet.filter(pa => pa.personId !== personId && pa.petId !== petId);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.ownerPet);

        return personAddress ? personAddress : null;
    }

    remove(personId: string, petId: string): Observable<OwnerPet> {
        return of(this.removeSync(personId, petId));
    }

    findAllByPersonId(personId: string): Observable<OwnerPet[]> {
        return of(this.ownerPet.filter((pa) => pa.personId === personId));
    }

    findAllByPetId(petId: string): Observable<OwnerPet[]> {
        return of(this.ownerPet.filter((pa) => pa.petId === petId));
    }

    findAllByPersonIdsSync(personIds: string | string[]): OwnerPet[] {
        let peopleIds: string[];
        if (typeof personIds === 'string') {
            peopleIds = [ personIds ];
        } else {
            peopleIds = [ ...personIds ];
        }
        return [ ...this.ownerPet.filter((pa) => peopleIds.some(pid => pa.personId === pid)) ];
    }

    // findByValueSync(addressPartial: AddressQueryInput): OwnerPet[] {
    //     const addressLst = this.addressService.findAnyByInputSync(addressPartial);
    //     return [ ...this.ownerPet.filter((pa) => addressLst.some(address => pa.addressId === address.id)) ];
    // }

    findAllByPetIdsSync(petIds: string | string[]): OwnerPet[] {
        let petsIds: string[];
        if (typeof petIds === 'string') {
            petsIds = [ petIds ];
        } else {
            petsIds = [ ...petIds ];
        }
        return [ ...this.ownerPet.filter((pa) => petsIds.some(aid => pa.petId === aid)) ];
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/owner-pet.json');
        this.ownerPet = this.tableService.readData(this.channel);
    }
}
