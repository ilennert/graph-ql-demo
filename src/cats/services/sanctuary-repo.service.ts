
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { SanctuaryModel } from '../model/sanctuary.model';
import { PetSanctuary } from '../graphql.schema';
import { CreatePetSanctuaryInput } from '../graphql.schema';
import { TableManagementService } from '../services/table-management.service';
import { AddressRepoService } from '../services/address-repo.service';
import { CatRepoService } from '../services/cats-repo.service';

@Injectable()
export class SanctuaryRepoService {
    private sanctuaries: SanctuaryModel[] = [];
    private channel: number;

    create(inData: CreatePetSanctuaryInput): Observable<PetSanctuary> {
        const sanctuary: SanctuaryModel = {
            id: Guid.create().toString(),
            name: inData.name,
            addressRef: inData.addressRef,
            catInventoryRef: []
        };
        this.sanctuaries = [ ...this.sanctuaries, sanctuary ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.sanctuaries);

        const retval: PetSanctuary = {
            id: sanctuary.id,
            name: sanctuary.name,
            address: this.addressService.findOneByIdSync(sanctuary.addressRef),
            catInventory: []
        };

        return of(retval);
    }

    remove(id: string): Observable<PetSanctuary> {
        const sanctuary = this.sanctuaries.find(s => s.id === id);
        const retval: PetSanctuary = {
            id: sanctuary.id,
            name: sanctuary.name,
            address: this.addressService.findOneByIdSync(sanctuary.addressRef),
            catInventory: sanctuary.catInventoryRef.map(cid => this.catService.findOneByIdSync(cid))
        };
        this.sanctuaries = this.sanctuaries.filter(s => s.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.sanctuaries);
        return of(retval);
    }

    findAll(limit?: number): Observable<PetSanctuary[]> {
        limit = !limit ? this.sanctuaries.length : limit;
        return of(this.sanctuaries.filter((s, i) => i < limit).map(s => {
            const retval: PetSanctuary = {
                id: s.id,
                name: s.name,
                address: this.addressService.findOneByIdSync(s.addressRef),
                catInventory: s.catInventoryRef.map(cid => this.catService.findOneByIdSync(cid))
            };
            return retval;
        }));
    }

    findOneById(id: string): Observable<PetSanctuary> {
        const sanctuary = this.sanctuaries.find(c => c.id === id);
        const retval: PetSanctuary = {
            id: sanctuary.id,
            name: sanctuary.name,
            address: this.addressService.findOneByIdSync(sanctuary.addressRef),
            catInventory: sanctuary.catInventoryRef.map(cid => this.catService.findOneByIdSync(cid))
        };
        return of(retval);
    }

    update(id: string, update: Partial<SanctuaryModel>): Observable<PetSanctuary> {
        const sanctuary = this.sanctuaries.find(c => c.id === id);
        if (!sanctuary) {
            return of(null);
        }
        const changedSanctuary: SanctuaryModel = {
            ...sanctuary,
            ...update
        };
        const changedPetSanctuary: PetSanctuary = {
            id: changedSanctuary.id,
            name: changedSanctuary.name,
            address: this.addressService.findOneByIdSync(changedSanctuary.addressRef),
            catInventory: changedSanctuary.catInventoryRef.map(cid => this.catService.findOneByIdSync(cid))
        };
        this.sanctuaries = this.sanctuaries.map(el => {
            if (el.id === id) {
                return changedSanctuary;
            }
            return el;
        });
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.sanctuaries);
        return of(changedPetSanctuary);
    }

    constructor(private readonly tableService: TableManagementService,
                private readonly addressService: AddressRepoService,
                private readonly catService: CatRepoService) {
        this.channel = this.tableService.tableChannel('data/santuaries.json');
        this.sanctuaries = this.tableService.readData(this.channel);
    }
}
