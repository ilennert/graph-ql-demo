
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { PetInput } from '../graphql.schema';
import { PetItem, initPetItem } from 'src/pets/model';
import { TableManagementService } from './table-management.service';
import { SpeciesRepoService } from './species-repo.service';

@Injectable()
export class PetRepoService {
    private pets: PetItem[] = [];
    private channel: number;

    create(inData: PetInput): Observable<PetItem> {
        const pet: PetItem = {
            id: inData.id ? inData.id : Guid.create().toString(),
            name: inData.name,
            age: inData.age,
            breed: inData.breed,
            speciesId: this.speciesService.findOneByNameSync(inData.species).id
        };
        if (this.pets.find(c => c.id === pet.id)) {
            throw {
                code: 'DUP',
                message: `There is already a pet with that id: ${pet.id}`
            };
        }
        this.pets = [ ...this.pets, pet ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.pets);

        return of(pet);
    }

    remove(id: string): Observable<PetItem> {
        const pet = this.pets.find(c => c.id === id);
        this.pets = this.pets.filter(c => c.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.pets);

        return of(pet);
    }

    findAll(limit?: number): Observable<PetItem[]> {
        limit = !limit ? this.pets.length : limit;
        return of(this.pets.filter((c, i) => i < limit));
    }

    findOneById(id: string): Observable<PetItem> {
        return of(this.findOneByIdSync(id));
    }

    findOneByIdSync(id: string): PetItem {
        const pet = this.pets.find(c => c.id === id);
        return pet;
    }

    update(id: string, update: Partial<PetInput>): Observable<PetItem> {     // will not update owners of pets
        const pet = this.pets.find(c => c.id === id);
        if (!pet) {
            return of(undefined);
        }
        try {
            const newPet: PetItem = {
                ...pet,
                name: update.name ? update.name : pet.name,
                age: update.age ? update.age : pet.age,
                breed: update.breed ? update.breed : pet.breed,
                speciesId: update.species ? this.speciesService.findOneByNameSync(update.species).id : pet.speciesId
            };
            this.pets = this.pets.map(el => {
                if (el.id === id) {
                    return newPet;
                }
                return el;
            });
            // re-write the list with the object that has been updated
            // same as remove
            this.tableService.writeData(this.channel, this.pets);
            return of(newPet);
        } catch (err) {
            throw err;
        }
    }

    constructor(private readonly tableService: TableManagementService,
                private readonly speciesService: SpeciesRepoService) {
        this.channel = this.tableService.tableChannel('data/pets.json');
        this.pets = this.tableService.readData(this.channel);
    }
}
