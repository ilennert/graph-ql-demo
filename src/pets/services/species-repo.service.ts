
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { Species, SpeciesInput } from '../graphql.schema';
import { Helpers } from '../helpers/helpers';
import { initSpecies } from '../model/species.model';
import { TableManagementService } from './table-management.service';

@Injectable()
export class SpeciesRepoService {
    private speciess: Species[] = [];
    private channel: number;

    createSync(inData: SpeciesInput): Species {
        const species: Species = {
            id: Guid.create().toString(),
            name: inData.name
        };
        this.speciess = [ ...this.speciess, species ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.speciess);

        return species;
    }

    create(inData: SpeciesInput): Observable<Species> {
        return of(this.createSync(inData));
    }

    remove(id: string): Observable<Species> {
        const address = this.speciess.find(a => a.id === id);
        this.speciess = this.speciess.filter(a => a.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.speciess);
        return of(address);
    }

    findAll(limit?: number): Observable<Species[]> {
        limit = !limit ? this.speciess.length : limit;
        return of(this.speciess.filter((a, i) => i < limit));
    }

    findAnyByInputSync(speciesInput?: Partial<SpeciesInput>): Species[] {
        if (speciesInput) {
            const result = this.speciess.filter(spc => {
                let flag = true;
                if (flag && speciesInput.name) {
                    flag = Helpers.testpattern(spc.name, speciesInput.name);
                }
                return flag;
            });
            return result;
        }
        return this.speciess;
    }

    findAnyByInput(speciesInput?: Partial<SpeciesInput>): Observable<Species[]> {
        return of(this.findAnyByInputSync(speciesInput));
    }

    findOneByIdSync(id: string): Species {
        return this.speciess.find(a => a.id === id);
    }

    findOneById(id: string): Observable<Species> {
        return of(this.findOneByIdSync(id));
    }

    findOneByNameSync(name: string): Species {
        return this.speciess.find(s => s.name === name);
    }

    update(id: string, update: Partial<Species>): Observable<Species> {
        const species = this.speciess.find(a => a.id === id);
        if (!species) {
            return of(initSpecies);
        }
        const newSpecies: Species = {
            ...species,
            ...update
        };
        this.speciess = this.speciess.map(el => {
            if (el.id === id) {
                return newSpecies;
            }
            return el;
        });
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.speciess);
        return of(newSpecies);
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/species.json');
        this.speciess = this.tableService.readData(this.channel);
    }
}
