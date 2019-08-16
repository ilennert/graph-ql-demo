
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { Address, AddressInput } from '../graphql.schema';
import { Helpers } from '../../helpers/helpers';
import { initAddress } from '../model/address.model';
import { TableManagementService } from '../services/table-management.service';

@Injectable()
export class AddressRepoService {
    private addresses: Address[] = [];
    private channel: number;

    create(inData: AddressInput): Observable<Address> {
        const address: Address = {
            id: Guid.create().toString(),
            street: inData.street,
            city: inData.city,
            stateProv: inData.stateProv,
            zipPostal: inData.zipPostal
        };
        this.addresses = [ ...this.addresses, address ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.addresses);

        return of(address);
    }

    remove(id: string): Observable<Address> {
        const address = this.addresses.find(a => a.id === id);
        this.addresses = this.addresses.filter(a => a.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.addresses);
        return of(address);
    }

    findAll(limit?: number): Observable<Address[]> {
        limit = !limit ? this.addresses.length : limit;
        return of(this.addresses.filter((a, i) => i < limit));
    }

    findAnyByInput(addressInput?: Partial<AddressInput>): Observable<Address[]> {
        if (addressInput) {
            const result = this.addresses.filter(adr => {
                let flag = true;
                if (flag && addressInput.street) {
                    flag = Helpers.testpattern(adr.street, addressInput.street);
                }
                if (flag && addressInput.city) {
                    flag = Helpers.testpattern(adr.city, addressInput.city);
                }
                if (flag && addressInput.stateProv) {
                    flag = Helpers.testpattern(adr.stateProv, addressInput.stateProv);
                }
                if (flag && addressInput.zipPostal) {
                    flag = Helpers.testpattern(adr.zipPostal, addressInput.zipPostal);
                }
                return flag;
            });
            return of(result);
        }
        return of(this.addresses);
    }

    findByInputSync(addressInput?: Partial<AddressInput>): Address[] {
        if (addressInput) {
            const result = this.addresses.filter(adr => {
                let flag = true;
                if (flag && addressInput.street) {
                    flag = Helpers.testpattern(adr.street, addressInput.street);
                }
                if (flag && addressInput.city) {
                    flag = Helpers.testpattern(adr.city, addressInput.city);
                }
                if (flag && addressInput.stateProv) {
                    flag = Helpers.testpattern(adr.stateProv, addressInput.stateProv);
                }
                if (flag && addressInput.zipPostal) {
                    flag = Helpers.testpattern(adr.zipPostal, addressInput.zipPostal);
                }
                return flag;
            });
            return result;
        }
        return this.addresses;
    }

    findOneById(id: string): Observable<Address> {
        return of(this.addresses.find(a => a.id === id));
    }

    findOneByIdSync(id: string): Address {
        return this.addresses.find(a => a.id === id);
    }

    update(id: string, update: Partial<Address>): Observable<Address> {
        const address = this.addresses.find(a => a.id === id);
        if (!address) {
            return of(initAddress);
        }
        const newCat: Address = {
            ...address,
            ...update
        };
        this.addresses = this.addresses.map(el => {
            if (el.id === id) {
                return newCat;
            }
            return el;
        });
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.addresses);
        return of(newCat);
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/addresses.json');
        this.addresses = this.tableService.readData(this.channel);
    }
}
