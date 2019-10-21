
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { SanctuaryModel } from '../model/sanctuary.model';
import { PetSanctuary, Address } from '../graphql.schema';
import { CreatePetSanctuaryInput } from '../graphql.schema';
import { PetSanctuaryInput } from '../graphql.schema';
import { TableManagementService } from './table-management.service';
import { AddressRepoService } from '../services/address-repo.service';
// import { PetRepoService } from '../services/pets-repo.service';
// import { OwnerRangeRepoService } from '../services/pet-owner-range-repo.service';

@Injectable()
export class SanctuaryRepoService {
    private sanctuaries: SanctuaryModel[] = [];
    private channel: number;

    createSync(inData: CreatePetSanctuaryInput): SanctuaryModel {
        const sanctuary: SanctuaryModel = {
            id: Guid.create().toString(),
            name: inData.name,
            addressId: inData.addressId
        };
        this.sanctuaries = [ ...this.sanctuaries, sanctuary ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.sanctuaries);

        // const retval: PetSanctuary = {
        //     id: sanctuary.id,
        //     name: sanctuary.name,
        //     address: this.addressService.findOneByIdSync(sanctuary.addressId),
        //     petInventory: []
        // };

        return sanctuary;
    }

    create(inData: CreatePetSanctuaryInput): Observable<SanctuaryModel> {
        return of(this.createSync(inData));
    }

    createFullSync(inData: PetSanctuaryInput): SanctuaryModel {
        const address: Address = this.addressService.createSync(inData.address);
        const sanctuary: SanctuaryModel = {
            id: Guid.create().toString(),
            name: inData.name,
            addressId: address.id
        };
        this.sanctuaries = [ ...this.sanctuaries, sanctuary ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.sanctuaries);

        return sanctuary;
    }

    createFull(inData: PetSanctuaryInput): Observable<SanctuaryModel> {
        return of(this.createFullSync(inData));
    }

    removeSync(id: string): SanctuaryModel {
        const sanctuary = this.sanctuaries.find(s => s.id === id);
        this.sanctuaries = this.sanctuaries.filter(s => s.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.sanctuaries);
        return sanctuary;
    }

    remove(id: string): Observable<SanctuaryModel> {
        return of(this.removeSync(id));
    }

    findAllSync(limit?: number): SanctuaryModel[] {
        limit = !limit ? this.sanctuaries.length : limit;
        return this.sanctuaries.filter((s, i) => i < limit);
    }

    findAll(limit?: number): Observable<SanctuaryModel[]> {
        return of(this.findAllSync(limit));
    }

    findOneByIdSync(id: string): SanctuaryModel {
        return this.sanctuaries.find(c => c.id === id);
    }

    findOneById(id: string): Observable<SanctuaryModel> {
        return of(this.findOneByIdSync(id));
    }

    updateSync(id: string, update: Partial<SanctuaryModel>): SanctuaryModel {
        const sanctuary = this.sanctuaries.find(c => c.id === id);
        if (!sanctuary) {
            return null;
        }
        const changedSanctuary: SanctuaryModel = {
            ...sanctuary,
            ...update
        };
        this.sanctuaries = this.sanctuaries.map(el => {
            if (el.id === id) {
                return changedSanctuary;
            }
            return el;
        });
        this.tableService.writeData(this.channel, this.sanctuaries);
        return changedSanctuary;
    }

    update(id: string, update: Partial<SanctuaryModel>): Observable<SanctuaryModel> {
        return of(this.updateSync(id, update));
    }

    constructor(private readonly tableService: TableManagementService,
                private readonly addressService: AddressRepoService) {
                // private readonly petService: PetRepoService,
                // private readonly petOwnerRangeService: OwnerRangeRepoService) {
        this.channel = this.tableService.tableChannel('data/santuaries.json');
        this.sanctuaries = this.tableService.readData(this.channel);
    }
}
