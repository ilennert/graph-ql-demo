
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

    findAllByPersonIdSync(personId: string): PersonAddress[] {
        return this.personAddresses.filter((pa) => pa.personId === personId);
    }

    findAllByAddressIdSync(addressId: string): PersonAddress[] {
        return this.personAddresses.filter((pa) => pa.addressId === addressId);
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/person-address.json');
        this.personAddresses = this.tableService.readData(this.channel);
    }
}
