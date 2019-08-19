
import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { CreateOwnerInput, Owner, Person, PersonInput } from '../graphql.schema';
import { Helpers } from '../helpers/helpers';
import { PersonItem } from '../model/person.model';
import { CatOwnerRangeItem, initCatOwnerRange } from '../model/cat-owner-range.model';
import { TableManagementService } from '../services/table-management.service';
import { AddressRepoService } from '../services/address-repo.service';
// import { CatRepoService } from '../services/cats-repo.service';
import { PersonAddressRepoService } from '../services/person-address-repo.service';
import { OwnerRangeRepoService } from '../services/cat-owner-range-repo.service';

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

    // createCatOwnerSync(inData: CreateOwnerInput): Owner {
    //     const person = this.people.find(p => p.id === inData.ownerId);

    //     // NOTE FOR BELOW, THERE IS NOTHING TO WRITE FOR THIS TABLE
    //     // re-write it to the file
    //     // append to file
    //     const now = new Date();
    //     inData.cats.map(cid => {
    //         const range: CatOwnerRangeItem = {
    //             ...initCatOwnerRange,
    //             ownerId: person.id,
    //             catId: cid.id,
    //             sanctuaryId: inData.sanctuaryId,
    //             start: new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    //         };
    //         this.catOwnerRangeService.createSync(range);
    //     });

    //     const retval: Owner = {
    //         id: person.id,
    //         name: person.name,
    //         address: this.personAddressService.findAllByPersonIdsSync(person.id)
    //             .map(pa => this.addressService.findOneByIdSync(pa.addressId)),
    //         birthdate: person.birthdate,
    //         cats: [...new Set(this.catOwnerRangeService.findAllRangesByOwner(person.id).map(c => c.cat))]
    //     };

    //     return retval;
    // }

    // createCatOwner(inData: CreateOwnerInput): Observable<Owner> {
    //     return of(this.createCatOwnerSync(inData));
    // }

    removeSync(id: string): PersonItem {
        const person = this.people.find(p => p.id === id);
        this.people = this.people.filter(p => p.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.people);

        // const retval: Owner = {
        //     id: person.id,
        //     name: person.name,
        //     address: this.personAddressService.findAllByPersonIdsSync(person.id)
        //         .map(pa => this.addressService.findOneByIdSync(pa.addressId)),
        //     birthdate: person.birthdate,
        //     cats: [...new Set(this.catOwnerRangeService.findAllRangesByOwner(person.id).map(c => c.cat))]
        // };

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
        //     const retval: Owner = {
        //         id: p.id,
        //         name: p.name,
        //         address: this.personAddressService.findAllByPersonIdsSync(p.id)
        //             .map(pa => this.addressService.findOneByIdSync(pa.addressId)),
        //         birthdate: p.birthdate,
        //         cats: [...new Set(this.catOwnerRangeService.findAllRangesByOwner(p.id).map(c => c.cat))]
        //     };
        //     return retval;
        // });
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
            // .map(person => {
            //     return {
            //         id: person.id,
            //         name: person.name,
            //         address: this.personAddressService.findAllByPersonIdsSync(person.id)
            //             .map(pa => this.addressService.findOneByIdSync(pa.addressId)),
            //         birthdate: person.birthdate,
            //         cats: [...new Set(this.catOwnerRangeService.findAllRangesByOwner(person.id).map(c => c.cat))]
            //     };
            // });
    }

    findPeopleByList(ids?: string[]): Observable<PersonItem[]> {
        return of(this.findPeopleByListSync(ids));
    }

    findOneByIdSync(id: string): PersonItem {
        return this.people.find(p => p.id === id);
        // return {
        //     id: person.id,
        //     name: person.name,
        //     address: this.personAddressService.findAllByPersonIdsSync(person.id)
        //         .map(pa => this.addressService.findOneByIdSync(pa.addressId)),
        //     birthdate: person.birthdate,
        //     cats: [...new Set(this.catOwnerRangeService.findAllRangesByOwner(person.id).map(c => c.cat))]
        // };
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
        // const changedOwner: Owner = {
        //     id: person.id,
        //     name: person.name,
        //     address: this.personAddressService.findAllByPersonIdsSync(person.id)
        //         .map(pa => this.addressService.findOneByIdSync(pa.addressId)),
        //     birthdate: person.birthdate,
        //     cats: [...new Set(this.catOwnerRangeService.findAllRangesByOwner(person.id).map(c => c.cat))]
        // };
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.people);
        return changedOwnerItem;
    }

    update(id: string, update: Partial<Owner>): Observable<PersonItem> {
        return of(this.updateSync(id, update));
    }

    constructor(private readonly tableService: TableManagementService,
                private readonly addressService: AddressRepoService,
                // private readonly catService: CatRepoService,
                private readonly personAddressService: PersonAddressRepoService) {
                // @Inject(forwardRef(() => OwnerRangeRepoService))
                // private readonly catOwnerRangeService: OwnerRangeRepoService) {
        this.channel = this.tableService.tableChannel('data/owner.json');
        this.people = this.tableService.readData(this.channel);
    }
}
