
export class PetOwnerRangeItem {
    id: string;
    petId: string;
    ownerId?: string;
    sanctuaryId?: string;
    toOwner?: boolean;
    transactionDate: Date;
}

export const initPetOwnerRange: PetOwnerRangeItem = {
    id: '00000000-0000-0000-0000-000000000000',
    petId: '00000000-0000-0000-0000-000000000000',
    transactionDate: new Date('0001-01-01T00:00:00Z')
};
