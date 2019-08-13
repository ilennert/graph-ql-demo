
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { CreateCatDto } from 'src/cats/dto';
import { Cat } from '../graphql.schema';
import { CatItem, initCat } from 'src/cats/model';
import { TableManagementService } from '../services/table-management.service';
// import { OwnerRangeRepoService } from '../services/cat-owner-range-repo.service';

@Injectable()
export class CatRepoService {
    private cats: CatItem[] = [];
    private channel: number;

    create(inData: CreateCatDto): Observable<Cat> {
        const cat: CatItem = {
            id: inData.id ? inData.id : Guid.create().toString(),
            name: inData.name,
            age: inData.age,
            breed: inData.breed
        };
        if (this.cats.find(c => c.id === cat.id)) {
            return of(initCat);
        }
        this.cats = [ ...this.cats, cat ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.cats);

        const retval: Cat = {
            id: cat.id,
            name: cat.name,
            age: cat.age,
            breed: cat.breed
            // owners: this.oRangeService.findAllRangesByCat(cat.id)
        };

        return of(retval);
    }

    remove(id: string): Observable<Cat> {
        const cat = this.cats.find(c => c.id === id);
        this.cats = this.cats.filter(c => c.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.cats);

        const retval: Cat = {
            id: cat.id,
            name: cat.name,
            age: cat.age,
            breed: cat.breed
            // owners: this.oRangeService.findAllRangesByCat(cat.id)
        };
        return of(retval);
    }

    findAll(limit?: number): Observable<Cat[]> {
        limit = !limit ? this.cats.length : limit;
        return of(this.cats.filter((c, i) => i < limit).map(cat => {
            return {
                id: cat.id,
                name: cat.name,
                age: cat.age,
                breed: cat.breed
                // owners: this.oRangeService.findAllRangesByCat(cat.id)
            };
        }));
    }

    findOneById(id: string): Observable<Cat> {
        const cat = this.cats.find(c => c.id === id);
        return of({
            id: cat.id,
            name: cat.name,
            age: cat.age,
            breed: cat.breed
            // owners: this.oRangeService.findAllRangesByCat(cat.id)
        });
    }

    findOneByIdSync(id: string): Cat {
        const cat = this.cats.find(c => c.id === id);
        return {
            id: cat.id,
            name: cat.name,
            age: cat.age,
            breed: cat.breed
            // owners: this.oRangeService.findAllRangesByCat(cat.id)
        };
    }

    update(id: string, update: Partial<Cat>): Observable<Cat> {     // will not update owners of cats
        const cat = this.cats.find(c => c.id === id);
        if (!cat) {
            return of(undefined);
        }
        const newCat: CatItem = {
            ...cat,
            name: update.name ? update.name : cat.name,
            age: update.age ? update.age : cat.age,
            breed: update.breed ? update.breed : cat.breed
        };
        this.cats = this.cats.map(el => {
            if (el.id === id) {
                return newCat;
            }
            return el;
        });
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.cats);
        return of({
            id: newCat.id,
            name: newCat.name,
            age: newCat.age,
            breed: newCat.breed
            // owners: this.oRangeService.findAllRangesByCat(newCat.id)
        });
    }

    constructor(// private readonly oRangeService: OwnerRangeRepoService,
                private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/cats.json');
        this.cats = this.tableService.readData(this.channel);
    }
}
