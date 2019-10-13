
export class PetOwnerRangeItem {
    id: string;
    ownerId?: string;
    petId: string;
    sanctuaryId?: string;
    toOwner?: boolean;
    start: Date;
    end?: Date;
}

export const initPetOwnerRange: PetOwnerRangeItem = {
    id: '00000000-0000-0000-0000-000000000000',
    petId: '00000000-0000-0000-0000-000000000000',
    start: new Date('0001-01-01T00:00:00Z')
};
