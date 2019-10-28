
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class AddressIdInput {
    id: string;
}

export class AddressInput {
    street: string;
    city: string;
    stateProv: string;
    zipPostal: string;
}

export class AddressQueryInput {
    street?: string;
    city?: string;
    stateProv?: string;
    zipPostal?: string;
}

export class AddressUpdateInput {
    street?: string;
    city?: string;
    stateProv?: string;
    zipPostal?: string;
}

export class CreateOwnerInput {
    ownerId: string;
    sanctuaryId: string;
    pets: PetIdInput[];
}

export class CreatePetSanctuaryInput {
    name: string;
    addressId: string;
}

export class DateTimeInput {
    dateTime?: string;
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
    pm?: boolean;
    hour24?: boolean;
    zone?: string;
}

export class OwnerIdInput {
    id: string;
}

export class OwnerUpdateInput {
    name?: string;
    addresses?: AddressIdInput[];
    birthdate?: DateTime;
    pets?: PetIdInput[];
}

export class PersonInput {
    name: string;
    addresses: AddressInput[];
    birthdate?: DateTimeInput;
}

export class PersonQueryInput {
    name: string;
    addresses?: AddressQueryInput[];
    birthdate?: DateTimeInput;
}

export class PetIdInput {
    id: string;
}

export class PetInput {
    id?: string;
    name: string;
    age: number;
    breed: string;
    species: string;
}

export class PetOwnerRangeInput {
    petId: string;
    ownerId?: string;
    sanctuaryId?: string;
    toOwner?: boolean;
    transactionDate: DateTimeInput;
}

export class PetSanctuaryIdInput {
    id: string;
}

export class PetSanctuaryInput {
    name: string;
    address: AddressInput;
}

export class SpeciesInput {
    name: string;
}

export class TransferPetInput {
    sanctuaryId: string;
    petId: string;
    ownerId?: string;
    toOwner?: boolean;
}

export class UpdatePetInput {
    name?: string;
    age?: number;
    breed?: string;
}

export class Address {
    id: string;
    street: string;
    city: string;
    stateProv: string;
    zipPostal: string;
}

export abstract class IMutation {
    abstract createPet(petInput: PetInput): Pet | Promise<Pet>;

    abstract removePet(id: string): Pet | Promise<Pet>;

    abstract updatePet(id: string, updatePetInput: UpdatePetInput): Pet | Promise<Pet>;

    abstract createPerson(personInput: PersonInput): Person | Promise<Person>;

    abstract removePerson(id: string): Owner | Promise<Owner>;

    abstract createPetOwner(createOwnerInput: CreateOwnerInput): Owner | Promise<Owner>;

    abstract createOwnerFromId(createOwner: OwnerIdInput): Owner | Promise<Owner>;

    abstract createPetSanctuary(createPetSanctuaryInput: CreatePetSanctuaryInput): PetSanctuary | Promise<PetSanctuary>;

    abstract createPetSanctuaryFull(petSanctuaryInput: PetSanctuaryInput): PetSanctuary | Promise<PetSanctuary>;

    abstract createAddress(addressInput: AddressInput): Address | Promise<Address>;

    abstract removeAddress(id: string): Address | Promise<Address>;

    abstract updateAddress(id: string, updateAddress: AddressUpdateInput): Address | Promise<Address>;

    abstract createPersonAddress(personId: string, addressId: string): Owner | Promise<Owner>;

    abstract removePersonAddress(personId: string, addressId: string): Owner | Promise<Owner>;

    abstract changePetOwnership(transferPetInput: TransferPetInput): PetOwnerRange | Promise<PetOwnerRange>;

    abstract createSpecies(speciesInput: SpeciesInput): Species | Promise<Species>;
}

export class Owner {
    id: string;
    name: string;
    addresses: Address[];
    birthdate?: DateTime;
    pets?: Pet[];
}

export class OwnerNHistory {
    id: string;
    name: string;
    addresses: Address[];
    birthdate?: DateTime;
}

export class Person {
    id: string;
    name: string;
    addresses: Address[];
    birthdate?: DateTime;
}

export class Pet {
    id: string;
    name: string;
    age: number;
    breed: string;
    species: string;
    owners: PetOwnerRange[];
}

export class PetNHistory {
    id: string;
    name: string;
    age: number;
    breed: string;
}

export class PetOwnerRange {
    id: string;
    pet: PetNHistory;
    owner?: OwnerNHistory;
    sanctuary?: PetSanctuaryNHistory;
    toOwner?: boolean;
    transactionDate: DateTime;
}

export class PetSanctuary {
    id: string;
    name: string;
    address: Address;
    petInventory: Pet[];
}

export class PetSanctuaryNHistory {
    id: string;
    name: string;
    address: Address;
}

export abstract class IQuery {
    abstract addresses(queryInput?: AddressQueryInput): Address[] | Promise<Address[]>;

    abstract people(personInput?: PersonQueryInput): Owner[] | Promise<Owner[]>;

    abstract person(id: string): Owner | Promise<Owner>;

    abstract pets(): Pet[] | Promise<Pet[]>;

    abstract pet(id: string): Pet | Promise<Pet>;

    abstract petsWithOwners(): PetOwnerRange[] | Promise<PetOwnerRange[]>;

    abstract petsWithoutOwners(): PetOwnerRange[] | Promise<PetOwnerRange[]>;

    abstract petOwners(): Owner[] | Promise<Owner[]>;

    abstract petSanctuaries(): PetSanctuary[] | Promise<PetSanctuary[]>;

    abstract species(speciesInput?: SpeciesInput): Species[] | Promise<Species[]>;
}

export class Species {
    id: string;
    name: string;
}

export abstract class ISubscription {
    abstract petCreated(): Pet | Promise<Pet>;

    abstract petRemoved(): Pet | Promise<Pet>;

    abstract petUpdated(): Pet | Promise<Pet>;

    abstract petOwnershipChanged(): PetOwnerRange | Promise<PetOwnerRange>;

    abstract personAdded(): Person | Promise<Person>;

    abstract sanctuaryAdded(): PetSanctuary | Promise<PetSanctuary>;
}

export type DateTime = any;
