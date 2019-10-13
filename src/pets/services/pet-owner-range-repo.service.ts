
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Guid } from 'guid-typescript';

// import { PetOwnerRangeInput, PetOwnerRange, DateTimeInput } from '../graphql.schema';
import { TableManagementService } from './table-management.service';
import { PetRepoService } from './pets-repo.service';
import { OwnerRepoService } from './owner-repo.service';
import { SanctuaryRepoService } from './sanctuary-repo.service';
import { PetOwnerRangeItem, initPetOwnerRange } from '../model/pet-owner-range.model';

@Injectable()
export class OwnerRangeRepoService {
    private petRanges: PetOwnerRangeItem[] = [];
    private channel: number;

    createSync(inData: PetOwnerRangeItem): PetOwnerRangeItem {
        inData = {
            ...initPetOwnerRange,
            id: Guid.create().toString(),
            ownerId: inData.ownerId,
            petId: inData.petId,
            sanctuaryId: inData.sanctuaryId,
            start: inData.start,
            end: inData.end
        };
        // Run checks for a valid owner-range connection
        // TODO: THIS IS IMPORTANT!
        this.petRanges = [ ...this.petRanges, inData ];

        // re-write it to the file
        // append to file
        this.tableService.writeData(this.channel, this.petRanges);

        // const retval: PetOwnerRange = {
        //     id: inData.id,
        //     pet: this.petService.findOneByIdSync(inData.petId),
        //     owner: inData.ownerId ? this.ownerService.findOneByIdSync(inData.ownerId) : undefined,
        //     sanctuary: inData.sanctuaryId ? this.sanctuaryService.findOneByIdSync(inData.sanctuaryId) : undefined,
        //     start: inData.start.toString(),
        //     end: inData.end ? inData.end.toString() : undefined
        // };

        // return retval;
        return inData;
    }

    create(inData: PetOwnerRangeItem): Observable<PetOwnerRangeItem> {
        return of(this.createSync(inData));
    }

    removeSync(id: string): PetOwnerRangeItem {
        const range = this.petRanges.find(p => p.id === id);
        this.petRanges = this.petRanges.filter(p => p.id !== id);
        // re-write the list without the object that has been removed
        // write complete file
        this.tableService.writeData(this.channel, this.petRanges);

        // const retval: PetOwnerRange = {
        //     id: range.id,
        //     pet: this.petService.findOneByIdSync(range.petId),
        //     owner: range.ownerId ? this.ownerService.findOneByIdSync(range.ownerId) : undefined,
        //     sanctuary: range.sanctuaryId ? this.sanctuaryService.findOneByIdSync(range.sanctuaryId) : undefined,
        //     start: range.start.toString(),
        //     end: range.end ? range.end.toString() : undefined
        // };

        // return range ? retval : null;
        return range;
    }

    remove(id: string): Observable<PetOwnerRangeItem> {
        return of(this.removeSync(id));
    }

    findAllSync(limit?: number): PetOwnerRangeItem[] {
        limit = !limit ? this.petRanges.length : limit;
        return this.petRanges.filter((a, i) => i < limit);
    }

    findAll(limit?: number): Observable<PetOwnerRangeItem[]> {
        limit = !limit ? this.petRanges.length : limit;
        return of(this.findAllSync(limit));
    }

    findAllRangesBySanctuarySync(sanctuaryId: string): PetOwnerRangeItem[] {
        return this.petRanges.filter((cor) => cor.sanctuaryId === sanctuaryId && !cor.ownerId);
    }

    findAllRangesByPetSync(petId: string): PetOwnerRangeItem[] {
        return this.petRanges.filter((cor) => cor.petId === petId);
    }

    findAllRangesByPetThatAreOwnerSync(petId: string): PetOwnerRangeItem[] {
        return this.petRanges.filter((cor) => cor.petId === petId && cor.ownerId);
    }

    findAllRangesByPetThatAreOwner(petId: string): Observable<PetOwnerRangeItem[]> {
        return of(this.findAllRangesByPetThatAreOwnerSync(petId));
    }

    findAllRangesByPet(petId: string): Observable<PetOwnerRangeItem[]> {
        return of(this.findAllRangesByPetSync(petId));
    }

    findAllRangesByOwner(ownerId: string): Observable<PetOwnerRangeItem[]> {
        return of(this.findAllRangesByOwnerSync(ownerId));
    }

    findAllRangesByOwnerSync(ownerId: string): PetOwnerRangeItem[] {
        return this.petRanges.filter((cor) => cor.ownerId === ownerId);
    }

    findAllRangesBySanctuary(sanctuaryId: string): Observable<PetOwnerRangeItem[]> {
        return of(this.findAllRangesBySanctuarySync(sanctuaryId));
    }

    findOneById(id: string): Observable<PetOwnerRangeItem> {
        return of(this.findOneByIdSync(id));
    }

    findOneByIdSync(id: string): PetOwnerRangeItem {
        return this.petRanges.find(p => p.id === id);
    }

    update(id: string, update: Partial<PetOwnerRangeItem>): Observable<PetOwnerRangeItem> {
        return of(this.updateSync(id, update));
    }

    updateSync(id: string, update: Partial<PetOwnerRangeItem>): PetOwnerRangeItem {
        const range = this.petRanges.find(a => a.id === id);
        if (!range) {
            return null;
        }
        const changedPetOwnerRangeItem: PetOwnerRangeItem = {
            ...range,
            ownerId: update.ownerId ? update.ownerId : range.ownerId,
            petId: update.petId && update.petId ? update.petId : range.petId,
            sanctuaryId: update.sanctuaryId ? update.sanctuaryId : range.sanctuaryId,
            start: update.start ? update.start : range.start,
            end: update.end ? update.end : range.end
        };
        this.petRanges = this.petRanges.map(el => {
            if (el.id === id) {
                return changedPetOwnerRangeItem;
            }
            return el;
        });
        // const changedOwner: PetOwnerRange = {
        //     id: changedPetOwnerRangeItem.id,
        //     pet: this.petService.findOneByIdSync(changedPetOwnerRangeItem.petId),
        //     owner: changedPetOwnerRangeItem.ownerId ? this.ownerService.findOneByIdSync(changedPetOwnerRangeItem.ownerId) : undefined,
        //     sanctuary: changedPetOwnerRangeItem.sanctuaryId ? this.sanctuaryService
        //  .findOneByIdSync(changedPetOwnerRangeItem.sanctuaryId) : undefined,
        //     start: changedPetOwnerRangeItem.start.toString(),
        //     end: changedPetOwnerRangeItem.end ? changedPetOwnerRangeItem.end.toString() : undefined
        // };
        // re-write the list with the object that has been updated
        // same as remove
        this.tableService.writeData(this.channel, this.petRanges);
        return changedPetOwnerRangeItem;
    }

    constructor(private readonly tableService: TableManagementService) {
        this.channel = this.tableService.tableChannel('data/pet-owner-range.json');
        this.petRanges = this.tableService.readData(this.channel);
    }
}
