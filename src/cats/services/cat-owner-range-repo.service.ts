
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

// import { CatOwnerRangeInput, CatOwnerRange, DateTimeInput } from '../graphql.schema';
import { TableManagementService } from '../services/table-management.service';
import { CatRepoService } from '../services/cats-repo.service';
import { OwnerRepoService } from '../services/owner-repo.service';
import { SanctuaryRepoService } from '../services/sanctuary-repo.service';
import { CatOwnerRangeItem, initCatOwnerRange } from '../model/cat-owner-range.model';

@Injectable()
export class OwnerRangeRepoService {
    private catRanges: CatOwnerRangeItem[] = [];
    private channel: number;

    createSync(inData: CatOwnerRangeItem): CatOwnerRangeItem {
        inData = {
            ...initCatOwnerRange,
            id: Guid.create().toString(),
            ownerId: inData.ownerId,
            catId: inData.catId,
            sanctuaryId: inData.sanctuaryId,
            start: inData.start,
            end: inData.end
        };
        // Run checks for a valid owner-range connection
        // TODO: THIS IS IMPORTANT!
        this.catRanges = [ ...this.catRanges, inData ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.catRanges);

        // const retval: CatOwnerRange = {
        //     id: inData.id,
        //     cat: this.catService.findOneByIdSync(inData.catId),
        //     owner: inData.ownerId ? this.ownerService.findOneByIdSync(inData.ownerId) : undefined,
        //     sanctuary: inData.sanctuaryId ? this.sanctuaryService.findOneByIdSync(inData.sanctuaryId) : undefined,
        //     start: inData.start.toString(),
        //     end: inData.end ? inData.end.toString() : undefined
        // };

        // return retval;
        return inData;
    }

    create(inData: CatOwnerRangeItem): Observable<CatOwnerRangeItem> {
        return of(this.createSync(inData));
    }

    removeSync(id: string): CatOwnerRangeItem {
        const range = this.catRanges.find(p => p.id === id);
        this.catRanges = this.catRanges.filter(p => p.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.catRanges);

        // const retval: CatOwnerRange = {
        //     id: range.id,
        //     cat: this.catService.findOneByIdSync(range.catId),
        //     owner: range.ownerId ? this.ownerService.findOneByIdSync(range.ownerId) : undefined,
        //     sanctuary: range.sanctuaryId ? this.sanctuaryService.findOneByIdSync(range.sanctuaryId) : undefined,
        //     start: range.start.toString(),
        //     end: range.end ? range.end.toString() : undefined
        // };

        // return range ? retval : null;
        return range;
    }

    remove(id: string): Observable<CatOwnerRangeItem> {
        return of(this.removeSync(id));
    }

    findAllSync(limit?: number): CatOwnerRangeItem[] {
        limit = !limit ? this.catRanges.length : limit;
        return this.catRanges.filter((a, i) => i < limit);
    }

    findAll(limit?: number): Observable<CatOwnerRangeItem[]> {
        limit = !limit ? this.catRanges.length : limit;
        return of(this.findAllSync(limit));
    }

    findAllRangesBySanctuarySync(sanctuaryId: string): CatOwnerRangeItem[] {
        return this.catRanges.filter((cor) => cor.sanctuaryId === sanctuaryId && !cor.ownerId);
    }

    findAllRangesByCatSync(catId: string): CatOwnerRangeItem[] {
        return this.catRanges.filter((cor) => cor.catId === catId);
    }

    findAllRangesByCatThatAreOwnerSync(catId: string): CatOwnerRangeItem[] {
        return this.catRanges.filter((cor) => cor.catId === catId && cor.ownerId);
    }

    findAllRangesByCatThatAreOwner(catId: string): Observable<CatOwnerRangeItem[]> {
        return of(this.findAllRangesByCatThatAreOwnerSync(catId));
    }

    findAllRangesByCat(catId: string): Observable<CatOwnerRangeItem[]> {
        return of(this.findAllRangesByCatSync(catId));
    }

    findAllRangesByOwner(ownerId: string): Observable<CatOwnerRangeItem[]> {
        return of(this.findAllRangesByOwnerSync(ownerId));
    }

    findAllRangesByOwnerSync(ownerId: string): CatOwnerRangeItem[] {
        return this.catRanges.filter((cor) => cor.ownerId === ownerId);
    }

    findAllRangesBySanctuary(sanctuaryId: string): Observable<CatOwnerRangeItem[]> {
        return of(this.findAllRangesBySanctuarySync(sanctuaryId));
    }

    findOneById(id: string): Observable<CatOwnerRangeItem> {
        return of(this.findOneByIdSync(id));
    }

    findOneByIdSync(id: string): CatOwnerRangeItem {
        return this.catRanges.find(p => p.id === id);
    }

    update(id: string, update: Partial<CatOwnerRangeItem>): Observable<CatOwnerRangeItem> {
        return of(this.updateSync(id, update));
    }

    updateSync(id: string, update: Partial<CatOwnerRangeItem>): CatOwnerRangeItem {
        const range = this.catRanges.find(a => a.id === id);
        if (!range) {
            return null;
        }
        const changedCatOwnerRangeItem: CatOwnerRangeItem = {
            ...range,
            ownerId: update.ownerId ? update.ownerId : range.ownerId,
            catId: update.catId && update.catId ? update.catId : range.catId,
            sanctuaryId: update.sanctuaryId ? update.sanctuaryId : range.sanctuaryId,
            start: update.start ? update.start : range.start,
            end: update.end ? update.end : range.end
        };
        this.catRanges = this.catRanges.map(el => {
            if (el.id === id) {
                return changedCatOwnerRangeItem;
            }
            return el;
        });
        // const changedOwner: CatOwnerRange = {
        //     id: changedCatOwnerRangeItem.id,
        //     cat: this.catService.findOneByIdSync(changedCatOwnerRangeItem.catId),
        //     owner: changedCatOwnerRangeItem.ownerId ? this.ownerService.findOneByIdSync(changedCatOwnerRangeItem.ownerId) : undefined,
        //     sanctuary: changedCatOwnerRangeItem.sanctuaryId ? this.sanctuaryService
        //  .findOneByIdSync(changedCatOwnerRangeItem.sanctuaryId) : undefined,
        //     start: changedCatOwnerRangeItem.start.toString(),
        //     end: changedCatOwnerRangeItem.end ? changedCatOwnerRangeItem.end.toString() : undefined
        // };
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.catRanges);
        return changedCatOwnerRangeItem;
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/cat-owner-range.json');
        this.catRanges = this.tableService.readData(this.channel);
    }
}
