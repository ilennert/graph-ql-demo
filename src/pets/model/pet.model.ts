
import { Pet } from '../graphql.schema';

export class PetItem {
    id: string;
    name: string;
    age: number;
    breed: string;
    speciesId: string;
}

export const initPet: Pet = {
    // b77d409a-10cd-4a47-8e94-b0cd0ab50aa1
    id: '00000000-0000-0000-0000-000000000000',
    name: '',
    age: 0,
    breed: '',
    species: '',
    owners: []
};

export const initPetItem: PetItem = {
    id: '00000000-0000-0000-0000-000000000000',
    name: '',
    age: 0,
    breed: '',
    speciesId: '00000000-0000-0000-0000-000000000000'
};
