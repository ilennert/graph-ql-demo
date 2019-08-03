
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { CreateCatDto } from 'src/cats/dto';
import { Cat, initCat } from 'src/cats/model';
import { TableManagementService } from '../services/table-management.service';

@Injectable()
export class CatsRepoService {
    private cats: Cat[] = [];
    private channel: number;

    create(cat: CreateCatDto): Observable<Cat> {
        const kitty: Cat = {
            id: cat.id ? cat.id : Guid.create().toString(),
            name: cat.name,
            age: cat.age,
            breed: cat.breed
        };
        if (this.cats.find(c => c.id === kitty.id)) {
            return of(initCat);
        }
        this.cats = [ ...this.cats, kitty ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.cats);

        return of(kitty);
    }

    remove(id: string): Observable<Cat> {
        const cat = this.cats.find(c => c.id === id);
        this.cats = this.cats.filter(c => c.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.cats);
        return of(cat);
    }

    findAll(limit?: number): Observable<Cat[]> {
        limit = !limit ? this.cats.length : limit;
        return of(this.cats.filter((c, i) => i < limit));
    }

    findOneById(id: string): Observable<Cat> {
        return of(this.cats.find(c => c.id === id));
    }

    update(id: string, update: Partial<Cat>): Observable<Cat> {
        const cat = this.cats.find(c => c.id === id);
        if (!cat) {
            return of(initCat);
        }
        const newCat: Cat = {
            ...cat,
            ...update
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
