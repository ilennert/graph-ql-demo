
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
        this.personAddresses = this.personAddresses.filter(pa => pa.personId === personId && pa.addressId === addressId);
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

    findAllByPersonIdSync(personIdi: string | string[]): PersonAddress[] {
        let personIdsLst: string[];
        let i = 0;
        if (typeof personIdi === 'string') {
            personIdsLst = [ personIdi ];
        } else {
            personIdsLst = [ ...personIdi ];
        }
        let result: PersonAddress[] = [];
        if (this.personAddresses && this.personAddresses.length) {
            do {
                result = [ ...result,
                    ...this.personAddresses.filter((pa) => pa.personId === personIdsLst[i++])];
            } while (i < personIdsLst.length);
            return result;
        }
        return [];
    }

    findAllByAddressIdSync(addressIdi: string | string[]): PersonAddress[] {
        let addressIdsLst: string[];
        let i = 0;
        if (typeof addressIdi === 'string') {
            addressIdsLst = [ addressIdi ];
        } else {
            addressIdsLst = [ ...addressIdi ];
        }
        let result: PersonAddress[];
        do {
            result = [ ...result,
                ...this.personAddresses.filter((pa) => pa.addressId === addressIdsLst[i++])];
        } while (i < addressIdsLst.length);
        return result;
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/person-address.json');
        this.personAddresses = this.tableService.readData(this.channel);
    }
}
