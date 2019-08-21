
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { Owner, Person, PersonInput } from '../graphql.schema';
import { Helpers } from '../helpers/helpers';
import { PersonItem } from '../model/person.model';
import { TableManagementService } from '../services/table-management.service';
import { AddressRepoService } from '../services/address-repo.service';
import { PersonAddressRepoService } from '../services/person-address-repo.service';

@Injectable()
export class OwnerRepoService {
    private people: PersonItem[] = [];
    private channel: number;

    createSync(inData: PersonInput): Person {
        const person: PersonItem = {
            id: Guid.create().toString(),
            name: inData.name,
            birthdate: Helpers.dateTimeInputToDate(inData.birthdate)
        };
        inData.address
            .map(aid => this.personAddressService.createSync(person.id, aid.id));
        this.people = [ ...this.people, person ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.people);

        const retval: Person = {
            id: person.id,
            name: person.name,
            address: this.personAddressService.findAllByPersonIdsSync(person.id)
                .map(pa => this.addressService.findOneByIdSync(pa.addressId)),
            birthdate: person.birthdate
        };

        return retval;
    }

    create(inData: PersonInput): Observable<Person> {
        return of(this.createSync(inData));
    }

    removeSync(id: string): PersonItem {
        const person = this.people.find(p => p.id === id);
        this.people = this.people.filter(p => p.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.people);

        return person ? person : null;
    }

    remove(id: string): Observable<PersonItem> {
        return of(this.removeSync(id));
    }

    // This returns a list of people from a list of addresses
    findByAddressIdsListSync(addressIds: string[]): string[] {
        const personAddress = this.personAddressService.findAllByAddressIdsSync(addressIds);
        return [ ...new Set(personAddress.map(pa => pa.personId)) ];
    }

    findAllSync(limit?: number): PersonItem[] {
        limit = !limit ? this.people.length : limit;
        return this.people.filter((a, i) => i < limit);     // .map(p => {
    }

    findAll(limit?: number): Observable<PersonItem[]> {
        return of(this.findAllSync(limit));
    }

    findByAddressIdsList(addressIds: string[]): Observable<string[]> {
        return of(this.findByAddressIdsListSync(addressIds));
    }

    findPeopleFromListAndInputSync(peopleIdsList?: string[], personInput?: Partial<PersonInput>): string[] {
        return this.people.filter(po => !peopleIdsList || peopleIdsList.some(id => po.id === id))
            .filter(po => {
                let flag = !!personInput;
                if (flag && personInput.name) {
                    flag = Helpers.testpattern(po.name, personInput.name);
                }
                return flag;
            }).map(oi => oi.id);
    }

    findPeopleFromListAndInput(peopleIdsList?: string[], personInput?: Partial<PersonInput>): Observable<string[]> {
        return of(this.findPeopleFromListAndInputSync(peopleIdsList, personInput));
    }

    findPeopleByListSync(ids?: string[]): PersonItem[] {
        return this.people.filter(p => !ids || ids.some(id => p.id === id));
    }

    findPeopleByList(ids?: string[]): Observable<PersonItem[]> {
        return of(this.findPeopleByListSync(ids));
    }

    findOneByIdSync(id: string): PersonItem {
        return this.people.find(p => p.id === id);
    }

    findOneById(id: string): Observable<PersonItem> {
        return of(this.findOneByIdSync(id));
    }

    updateSync(id: string, update: Partial<PersonItem>): PersonItem {
        const person = this.people.find(a => a.id === id);
        if (!person) {
            return null;
        }
        const changedOwnerItem: PersonItem = {
            ...person,
            ...update
        };
        this.people = this.people.map(el => {
            if (el.id === id) {
                return changedOwnerItem;
            }
            return el;
        });
        this.tableService.writeData(this.channel, this.people);
        return changedOwnerItem;
    }

    update(id: string, update: Partial<Owner>): Observable<PersonItem> {
        return of(this.updateSync(id, update));
    }

    constructor(private readonly tableService: TableManagementService,
                private readonly addressService: AddressRepoService,
                private readonly personAddressService: PersonAddressRepoService) {
        this.channel = this.tableService.tableChannel('data/owner.json');
        this.people = this.tableService.readData(this.channel);
    }
}
