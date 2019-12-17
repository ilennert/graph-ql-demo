
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { TableManagementService } from './table-management.service';
// import { AddressRepoService } from './address-repo.service';
import { SanctuaryPet } from '../model/sanctuary-pet.model';
// import { AddressQueryInput } from '../graphql.schema';

@Injectable()
export class SanctuaryPetRepoService {
    private sanctuaryPet: SanctuaryPet[] = [];
    private channel: number;

    createSync(sanctuaryId: string, petId: string): SanctuaryPet {
        if (this.sanctuaryPet.find(pa => pa.sanctuaryId === sanctuaryId &&
            pa.petId === petId)) {
                throw new Error('Can not duplicate a OwnerPet');
        }
        const sanctuaryPet: SanctuaryPet = {
            sanctuaryId,
            petId
        };
        this.sanctuaryPet = [ ...this.sanctuaryPet, sanctuaryPet ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.sanctuaryPet);

        return sanctuaryPet;
    }

    create(sanctuaryId: string, petId: string): Observable<SanctuaryPet> {
        return of(this.createSync(sanctuaryId, petId));
    }

    removeSync(sanctuaryId: string, petId: string): SanctuaryPet {
        const sanctuaryPet = this.sanctuaryPet.find(pa => pa.sanctuaryId === sanctuaryId && pa.petId === petId);
        if (!sanctuaryPet) {
            throw new Error('PersonAddress not found');
        }
        this.sanctuaryPet = this.sanctuaryPet.filter(pa => pa.sanctuaryId !== sanctuaryId && pa.petId !== petId);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.sanctuaryPet);

        return sanctuaryPet ? sanctuaryPet : null;
    }

    remove(personId: string, petId: string): Observable<SanctuaryPet> {
        return of(this.removeSync(personId, petId));
    }

    findAllBySanctuaryId(sanctuaryId: string): Observable<SanctuaryPet[]> {
        return of(this.sanctuaryPet.filter((pa) => pa.sanctuaryId === sanctuaryId));
    }

    findAllByPetId(petId: string): Observable<SanctuaryPet[]> {
        return of(this.sanctuaryPet.filter((pa) => pa.petId === petId));
    }

    findAllBySanctuaryIdsSync(sanctuaryIds: string | string[]): SanctuaryPet[] {
        let sanctuariesIds: string[];
        if (typeof sanctuaryIds === 'string') {
            sanctuariesIds = [ sanctuaryIds ];
        } else {
            sanctuariesIds = [ ...sanctuaryIds ];
        }
        return [ ...this.sanctuaryPet.filter((pa) => sanctuariesIds.some(pid => pa.sanctuaryId === pid)) ];
    }

    // findByValueSync(addressPartial: AddressQueryInput): OwnerPet[] {
    //     const addressLst = this.addressService.findAnyByInputSync(addressPartial);
    //     return [ ...this.ownerPet.filter((pa) => addressLst.some(address => pa.addressId === address.id)) ];
    // }

    findAllByPetIdsSync(petIds: string | string[]): SanctuaryPet[] {
        let petsIds: string[];
        if (typeof petIds === 'string') {
            petsIds = [ petIds ];
        } else {
            petsIds = [ ...petIds ];
        }
        return [ ...this.sanctuaryPet.filter((pa) => petsIds.some(aid => pa.petId === aid)) ];
    }

    constructor(private readonly tableService: TableManagementService   // ,
                /* private readonly addressService: AddressRepoService */) {
        this.channel = this.tableService.tableChannel('data/sanctuary-pet.json');
        this.sanctuaryPet = this.tableService.readData(this.channel);
    }
}
