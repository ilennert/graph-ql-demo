
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { CreatePersonInput, Owner, PersonInput } from '../graphql.schema';
import { OwnerItem } from '../model/owner.model';
import { PersonAddress } from '../model/person-address.model';
import { TableManagementService } from '../services/table-management.service';
import { AddressRepoService } from '../services/address-repo.service';
import { CatRepoService } from '../services/cats-repo.service';
import { PersonAddressRepoService } from '../services/person-address-repo.service';

@Injectable()
export class OwnerRepoService {
    private people: OwnerItem[] = [];
    private channel: number;

    create(inData: CreatePersonInput): Observable<Owner> {
        const person: OwnerItem = {
            id: Guid.create().toString(),
            name: inData.name,
            addressRef: inData.address.map(aid => aid.id),
            birthdate: inData.birthdate,
            catIds: []
        };
        this.people = [ ...this.people, person ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.people);

        const retval: Owner = {
            id: person.id,
            name: person.name,
            address: person.addressRef.map(aid => this.addressService.findOneByIdSync(aid)),
            birthdate: person.birthdate,
            cats: []
        };

        return of(retval);
    }

    remove(id: string): Observable<Owner> {
        const person = this.people.find(p => p.id === id);
        this.people = this.people.filter(p => p.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.people);

        const retval: Owner = {
            id: person.id,
            name: person.name,
            address: person.addressRef.map(aid => this.addressService.findOneByIdSync(aid)),
            birthdate: person.birthdate,
            cats: person.catIds.map(cid => this.catService.findOneByIdSync(cid))
        };

        return of(person ? retval : null);
    }

    findByAddressIdsList(addressIds: string[]): string[] {
        const personAddress = this.personAddressService.findAllByAddressIdSync(addressIds);
        return [ ...new Set(personAddress.map(pa => pa.personId)) ];
    }

    findAll(limit?: number): Observable<Owner[]> {
        limit = !limit ? this.people.length : limit;
        return of(this.people.filter((a, i) => i < limit).map(p => {
            const retval: Owner = {
                id: p.id,
                name: p.name,
                address: p.addressRef.map(aid => this.addressService.findOneByIdSync(aid)),
                birthdate: p.birthdate,
                cats: p.catIds.map(cid => this.catService.findOneByIdSync(cid))
            };
            return retval;
        }));
    }

    findPeopleByList(ids: string[]): Observable<Owner[]> {
        return of(this.people.filter(p => ids.some(id => p.id === id))
            .map(person => {
                return {
                    id: person.id,
                    name: person.name,
                    address: person.addressRef.map(aid => this.addressService.findOneByIdSync(aid)),
                    birthdate: person.birthdate,
                    cats: person.catIds.map(cid => this.catService.findOneByIdSync(cid))
                };
            }));
    }

    findOneById(id: string): Observable<Owner> {
        const person = this.people.find(p => p.id === id);
        return of({
            id: person.id,
            name: person.name,
            address: person.addressRef.map(aid => this.addressService.findOneByIdSync(aid)),
            birthdate: person.birthdate,
            cats: person.catIds.map(cid => this.catService.findOneByIdSync(cid))
        });
    }

    findOneByIdSync(id: string): Owner {
        const person = this.people.find(p => p.id === id);
        return {
            id: person.id,
            name: person.name,
            address: person.addressRef.map(aid => this.addressService.findOneByIdSync(aid)),
            birthdate: person.birthdate,
            cats: person.catIds.map(cid => this.catService.findOneByIdSync(cid))
        };
    }

    update(id: string, update: Partial<Owner>): Observable<Owner> {
        const person = this.people.find(a => a.id === id);
        if (!person) {
            return of(null);
        }
        const changedOwnerItem: OwnerItem = {
            ...person,
            ...update
        };
        this.people = this.people.map(el => {
            if (el.id === id) {
                return changedOwnerItem;
            }
            return el;
        });
        const changedOwner: Owner = {
            id: changedOwnerItem.id,
            name: changedOwnerItem.name,
            address: changedOwnerItem.addressRef.map(aid => this.addressService.findOneByIdSync(aid)),
            birthdate: changedOwnerItem.birthdate,
            cats: changedOwnerItem.catIds.map(cid => this.catService.findOneByIdSync(cid))
        };
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.people);
        return of(changedOwner);
    }

    constructor(private readonly tableService: TableManagementService,
                private readonly addressService: AddressRepoService,
                private readonly catService: CatRepoService,
                private readonly personAddressService: PersonAddressRepoService) {
        this.channel = this.tableService.tableChannel('data/owner.json');
        this.people = this.tableService.readData(this.channel);
    }
}
