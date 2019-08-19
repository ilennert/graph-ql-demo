
export class CatOwnerRangeItem {
    id: string;
    ownerId?: string;
    catId: string;
    sanctuaryId?: string;
    start: Date;
    end?: Date;
}

export const initCatOwnerRange: CatOwnerRangeItem = {
    id: '00000000-0000-0000-0000-000000000000',
    ownerId: undefined,
    catId: '00000000-0000-0000-0000-000000000000',
    sanctuaryId: undefined,
    start: new Date('0001-01-01T00:00:00Z'),
    end: undefined
};