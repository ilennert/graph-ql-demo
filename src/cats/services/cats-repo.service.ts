
import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { Cat, CreateCatInput } from '../graphql.schema';
import { CatItem, initCat } from 'src/cats/model';
import { TableManagementService } from '../services/table-management.service';
import { OwnerRangeRepoService } from '../services/cat-owner-range-repo.service';

@Injectable()
export class CatRepoService {
    private cats: CatItem[] = [];
    private channel: number;

    create(inData: CreateCatInput): Observable<CatItem> {
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

        return of(cat);
    }

    remove(id: string): Observable<CatItem> {
        const cat = this.cats.find(c => c.id === id);
        this.cats = this.cats.filter(c => c.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.cats);

        return of(cat);
    }

    findAll(limit?: number): Observable<CatItem[]> {
        limit = !limit ? this.cats.length : limit;
        return of(this.cats.filter((c, i) => i < limit));
    }

    findOneById(id: string): Observable<CatItem> {
        return of(this.findOneByIdSync(id));
    }

    findOneByIdSync(id: string): CatItem {
        const cat = this.cats.find(c => c.id === id);
        return cat;
    }

    update(id: string, update: Partial<CatItem>): Observable<CatItem> {     // will not update owners of cats
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
        return of(newCat);
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/cats.json');
        this.cats = this.tableService.readData(this.channel);
    }
}
