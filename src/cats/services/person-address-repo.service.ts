
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { TableManagementService } from '../services/table-management.service';
import { PersonAddress } from '../model/person-address.model';

@Injectable()
export class PersonAddressRepoService {
    private personAddresses: PersonAddress[] = [];
    private channel: number;

    create(personId: string, addressId: string): Observable<PersonAddress> {
        const personAddress: PersonAddress = {
            personId,
            addressId
        };
        this.personAddresses = [ ...this.personAddresses, personAddress ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.personAddresses);

        return of(personAddress);
    }

    remove(personId: string, addressId: string): Observable<PersonAddress> {
        const personAddress = this.personAddresses.find(pa => pa.personId === personId && pa.addressId === addressId);
        this.personAddresses = this.personAddresses.filter(pa => pa.personId === personId && pa.addressId === addressId);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.personAddresses);

        return of(personAddress ? personAddress : null);
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
        let result: PersonAddress[];
        do {
            result = [ ...result,
                ...this.personAddresses.filter((pa) => pa.personId === personIdsLst[i++])];
        } while (i < personIdsLst.length);
        return result;
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
