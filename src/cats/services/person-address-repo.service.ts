
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { TableManagementService } from '../services/table-management.service';
import { PersonAddress } from '../model/person-address.model';

@Injectable()
export class PersonAddressRepoService {
    private personAddresses: PersonAddress[] = [];
    private channel: number;

    createSync(personId: string, addressId: string): PersonAddress {
        if (this.personAddresses.find(pa => pa.personId === personId &&
            pa.addressId === addressId)) {
                throw new Error('Can not duplicate a PersonAddress');
        }
        const personAddress: PersonAddress = {
            personId,
            addressId
        };
        this.personAddresses = [ ...this.personAddresses, personAddress ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.personAddresses);

        return personAddress;
    }

    create(personId: string, addressId: string): Observable<PersonAddress> {
        return of(this.createSync(personId, addressId));
    }

    removeSync(personId: string, addressId: string): PersonAddress {
        const personAddress = this.personAddresses.find(pa => pa.personId === personId && pa.addressId === addressId);
        if (!personAddress) {
            throw new Error('PersonAddress not found');
        }
        this.personAddresses = this.personAddresses.filter(pa => pa.personId !== personId && pa.addressId !== addressId);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.personAddresses);

        return personAddress ? personAddress : null;
    }

    remove(personId: string, addressId: string): Observable<PersonAddress> {
        return of(this.removeSync(personId, addressId));
    }

    findAllByPersonId(personId: string): Observable<PersonAddress[]> {
        return of(this.personAddresses.filter((pa) => pa.personId === personId));
    }

    findAllByAddressId(addressId: string): Observable<PersonAddress[]> {
        return of(this.personAddresses.filter((pa) => pa.addressId === addressId));
    }

    findAllByPersonIdsSync(personIds: string | string[]): PersonAddress[] {
        let peopleIds: string[];
        if (typeof personIds === 'string') {
            peopleIds = [ personIds ];
        } else {
            peopleIds = [ ...personIds ];
        }
        return [ ...this.personAddresses.filter((pa) => peopleIds.some(pid => pa.personId === pid)) ];
    }

    findAllByAddressIdsSync(addressIds: string | string[]): PersonAddress[] {
        let addressesIds: string[];
        if (typeof addressIds === 'string') {
            addressesIds = [ addressIds ];
        } else {
            addressesIds = [ ...addressIds ];
        }
        return [ ...this.personAddresses.filter((pa) => addressesIds.some(aid => pa.addressId === aid)) ];
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/person-address.json');
        this.personAddresses = this.tableService.readData(this.channel);
    }
}
