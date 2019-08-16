
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

import { CatOwnerRangeInput, CatOwnerRange, DateTimeInput } from '../graphql.schema';
import { TableManagementService } from '../services/table-management.service';
import { CatRepoService } from '../services/cats-repo.service';
import { OwnerRepoService } from '../services/owner-repo.service';
import { SanctuaryRepoService } from '../services/sanctuary-repo.service';
import { CatOwnerRangeItem, initCatOwnerRange } from '../model/cat-owner-range.model';

@Injectable()
export class OwnerRangeRepoService {
    private catRanges: CatOwnerRangeItem[] = [];
    private channel: number;

    createSync(inData: CatOwnerRangeItem): CatOwnerRange {
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
        // THIS IS IMPORTANT!
        this.catRanges = [ ...this.catRanges, inData ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.catRanges);

        const retval: CatOwnerRange = {
            id: inData.id,
            cat: this.catService.findOneByIdSync(inData.catId),
            owner: inData.ownerId ? this.ownerService.findOneByIdSync(inData.ownerId) : undefined,
            sanctuary: inData.sanctuaryId ? this.sanctuaryService.findOneByIdSync(inData.sanctuaryId) : undefined,
            start: inData.start.toString(),
            end: inData.end ? inData.end.toString() : undefined
        };

        return retval;
    }

    create(inData: CatOwnerRangeItem): Observable<CatOwnerRange> {
        return of(this.createSync(inData));
    }

    removeSync(id: string): CatOwnerRange {
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

        return range ? retval : null;
    }

    remove(id: string): Observable<CatOwnerRange> {
        return of(this.removeSync(id));
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

    findAllRangesBySanctuary(sanctuaryId: string): CatOwnerRange[] {
        return this.catRanges.filter((cor) => cor.sanctuaryId === sanctuaryId)
            .map(or => {
                return {
                    id: or.id,
                    cat: this.catService.findOneByIdSync(or.catId),
                    owner: or.ownerId ? this.ownerService.findOneByIdSync(or.ownerId) : undefined,
                    sanctuary: or.sanctuaryId ? this.sanctuaryService.findOneByIdSync(or.sanctuaryId) : undefined,
                    start: or.start.toString(),
                    end: or.end ? or.end.toString() : undefined
                };
            });
    }

    findAllRangesByCat(catId: string): CatOwnerRange[] {
        return this.catRanges.filter((cor) => cor.catId === catId)
            .map(or => {
                return {
                    id: or.id,
                    cat: this.catService.findOneByIdSync(or.catId),
                    owner: or.ownerId ? this.ownerService.findOneByIdSync(or.ownerId) : undefined,
                    sanctuary: or.sanctuaryId ? this.sanctuaryService.findOneByIdSync(or.sanctuaryId) : undefined,
                    start: or.start.toString(),
                    end: or.end ? or.end.toString() : undefined
                };
            });
    }

    findAllRangesByOwner(ownerId: string): CatOwnerRange[] {
        return this.catRanges.filter((cor) => cor.ownerId === ownerId)
            .map(or => {
                return {
                    id: or.id,
                    cat: this.catService.findOneByIdSync(or.catId),
                    owner: or.ownerId ? this.ownerService.findOneByIdSync(or.ownerId) : undefined,
                    sanctuary: or.sanctuaryId ? this.sanctuaryService.findOneByIdSync(or.sanctuaryId) : undefined,
                    start: or.start.toString(),
                    end: or.end ? or.end.toString() : undefined
                };
            });
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
        return of(this.findOneByIdSync(id));
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
        return of(this.updateSync(id, update));
    }

    updateSync(id: string, update: Partial<CatOwnerRange>): CatOwnerRange {
        const range = this.catRanges.find(a => a.id === id);
        if (!range) {
            return null;
        }
        const changedCatOwnerRangeItem: CatOwnerRangeItem = {
            ...range,
            ownerId: update.owner ? update.owner.id : range.ownerId,
            catId: update.cat && update.cat.id ? update.cat.id : range.catId,
            sanctuaryId: update.sanctuary ? update.sanctuary.id : range.sanctuaryId,
            start: update.start ? update.start : range.start,
            end: update.end ? update.end : range.end
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
        return changedOwner;
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
