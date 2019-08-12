
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { CatOwnerRangeInput, CatOwnerRange, DateTimeInput } from '../graphql.schema';
import { TableManagementService } from '../services/table-management.service';
import { CatRepoService } from '../services/cats-repo.service';
import { OwnerRepoService } from '../services/owner-repo.service';
import { SanctuaryRepoService } from '../services/sanctuary-repo.service';
import { CatOwnerRangeItem } from '../model/cat-owner-range.model';

@Injectable()
export class OwnerRangeRepoService {
    private catRanges: CatOwnerRangeItem[] = [];
    private channel: number;

    create(inData: CatOwnerRangeInput): Observable<CatOwnerRange> {
        const range: CatOwnerRangeItem = {
            id: Guid.create().toString(),
            ownerId: inData.ownerId,
            catId: inData.catId,
            sanctuaryId: inData.sanctuaryId,
            start: this.dateTimeHelper(inData.start),
            end: this.dateTimeHelper(inData.end)
        };
        this.catRanges = [ ...this.catRanges, range ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.catRanges);

        const retval: CatOwnerRange = {
            id: range.id,
            cat: this.catService.findOneByIdSync(range.catId),
            owner: range.ownerId ? this.ownerService.findOneByIdSync(range.ownerId) : undefined,
            sanctuary: range.sanctuaryId ? this.sanctuaryService.findOneByIdSync(range.sanctuaryId) : undefined,
            start: range.start.toString(),
            end: range.end ? range.end.toString() : undefined
        };

        return of(retval);
    }

    remove(id: string): Observable<CatOwnerRange> {
        const range = this.catRanges.find(p => p.id === id);
        this.catRanges = this.catRanges.filter(p => p.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.catRanges);

        const retval: CatOwnerRange = {
            id: range.id,
            cat: this.catService.findOneByIdSync(range.catId),
            owner: range.ownerId ? this.ownerService.findOneByIdSync(range.ownerId) : undefined,
            sanctuary: range.sanctuaryId ? this.sanctuaryService.findOneByIdSync(range.sanctuaryId) : undefined,
            start: range.start.toString(),
            end: range.end ? range.end.toString() : undefined
        };

        return of(range ? retval : null);
    }

    findAll(limit?: number): Observable<CatOwnerRange[]> {
        limit = !limit ? this.catRanges.length : limit;
        return of(this.catRanges.filter((a, i) => i < limit).map(cr => {
            const retval: CatOwnerRange = {
                id: cr.id,
                cat: this.catService.findOneByIdSync(cr.catId),
                owner: cr.ownerId ? this.ownerService.findOneByIdSync(cr.ownerId) : undefined,
                sanctuary: cr.sanctuaryId ? this.sanctuaryService.findOneByIdSync(cr.sanctuaryId) : undefined,
                start: cr.start.toString(),
                end: cr.end ? cr.end.toString() : undefined
                };
            return retval;
        }));
    }

    findAllRangesBySanctuary(sanctuaryId: string): CatOwnerRangeItem[] {
        return this.catRanges.filter((cor) => cor.sanctuaryId === sanctuaryId);
    }

    findAllRangesByCat(catId: string): CatOwnerRangeItem[] {
        return this.catRanges.filter((cor) => cor.catId === catId);
    }

    findAllRangesByOwner(ownerId: string): CatOwnerRangeItem[] {
        return this.catRanges.filter((cor) => cor.ownerId === ownerId);
    }

    findAllBySanctuary(limit?: number): Observable<CatOwnerRange[]> {
        limit = !limit ? this.catRanges.length : limit;
        return of(this.catRanges.filter((a, i) => i < limit).map(cr => {
            const retval: CatOwnerRange = {
                id: cr.id,
                cat: this.catService.findOneByIdSync(cr.catId),
                owner: cr.ownerId ? this.ownerService.findOneByIdSync(cr.ownerId) : undefined,
                sanctuary: cr.sanctuaryId ? this.sanctuaryService.findOneByIdSync(cr.sanctuaryId) : undefined,
                start: cr.start.toString(),
                end: cr.end ? cr.end.toString() : undefined
                };
            return retval;
        }));
    }

    findOneById(id: string): Observable<CatOwnerRange> {
        const range = this.catRanges.find(p => p.id === id);
        return of({
            id: range.id,
            cat: this.catService.findOneByIdSync(range.catId),
            owner: range.ownerId ? this.ownerService.findOneByIdSync(range.ownerId) : undefined,
            sanctuary: range.sanctuaryId ? this.sanctuaryService.findOneByIdSync(range.sanctuaryId) : undefined,
            start: range.start.toString(),
            end: range.end ? range.end.toString() : undefined
    });
    }

    findOneByIdSync(id: string): CatOwnerRange {
        const range = this.catRanges.find(p => p.id === id);
        return {
            id: range.id,
            cat: this.catService.findOneByIdSync(range.catId),
            owner: range.ownerId ? this.ownerService.findOneByIdSync(range.ownerId) : undefined,
            sanctuary: range.sanctuaryId ? this.sanctuaryService.findOneByIdSync(range.sanctuaryId) : undefined,
            start: range.start.toString(),
            end: range.end ? range.end.toString() : undefined
        };
    }

    update(id: string, update: Partial<CatOwnerRange>): Observable<CatOwnerRange> {
        const range = this.catRanges.find(a => a.id === id);
        if (!range) {
            return of(null);
        }
        const changedCatOwnerRangeItem: CatOwnerRangeItem = {
            ...range,
            ...update
        };
        this.catRanges = this.catRanges.map(el => {
            if (el.id === id) {
                return changedCatOwnerRangeItem;
            }
            return el;
        });
        const changedOwner: CatOwnerRange = {
            id: changedCatOwnerRangeItem.id,
            cat: this.catService.findOneByIdSync(changedCatOwnerRangeItem.catId),
            owner: changedCatOwnerRangeItem.ownerId ? this.ownerService.findOneByIdSync(changedCatOwnerRangeItem.ownerId) : undefined,
            sanctuary: changedCatOwnerRangeItem.sanctuaryId ? this.sanctuaryService.findOneByIdSync(changedCatOwnerRangeItem.sanctuaryId) : undefined,
            start: changedCatOwnerRangeItem.start.toString(),
            end: changedCatOwnerRangeItem.end ? changedCatOwnerRangeItem.end.toString() : undefined
        };
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.catRanges);
        return of(changedOwner);
    }

    constructor(private readonly tableService: TableManagementService,
                private readonly catService: CatRepoService,
                private readonly ownerService: OwnerRepoService,
                private readonly sanctuaryService: SanctuaryRepoService) {
        this.channel = this.tableService.tableChannel('data/cat-owner-range.json');
        this.catRanges = this.tableService.readData(this.channel);
    }

    private dateTimeHelper(date: DateTimeInput): Date | undefined {
        if (date) {
            return new Date(date.dateTime);
        }
        return undefined;
    }
}
