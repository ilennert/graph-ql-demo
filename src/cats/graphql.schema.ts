
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

export class CatIdInput {
    id: string;
}

export class CatOwnerRangeInput {
    catId: string;
    ownerId?: string;
    sanctuaryId?: string;
    start: DateTimeInput;
    end?: DateTimeInput;
}

export class CreateCatInput {
    id?: string;
    name: string;
    age: number;
    breed: string;
}

export class CreateOwnerInput {
    ownerId: string;
    sanctuaryId: string;
    cats: CatIdInput[];
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
    cats?: CatIdInput[];
}

export class PersonInput {
    name?: string;
    addresses: AddressIdInput[];
    birthdate?: DateTimeInput;
}

export class PetSanctuaryIdInput {
    id: string;
}

export class TransferPetInput {
    sanctuaryId: string;
    petId: string;
    ownerId?: string;
    toOwner?: boolean;
}

export class UpdateCatInput {
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

export class Cat {
    id: string;
    name: string;
    age: number;
    breed: string;
    owners: CatOwnerRange[];
}

export class CatNHistory {
    id: string;
    name: string;
    age: number;
    breed: string;
}

export class CatOwnerRange {
    id: string;
    cat: CatNHistory;
    owner?: OwnerNHistory;
    sanctuary?: PetSanctuaryNHistory;
    start: DateTime;
    end?: DateTime;
}

export abstract class IMutation {
    abstract createCat(createCatInput: CreateCatInput): Cat | Promise<Cat>;

    abstract removeCat(id: string): Cat | Promise<Cat>;

    abstract updateCat(id: string, updateCatInput: UpdateCatInput): Cat | Promise<Cat>;

    abstract createPerson(personInput: PersonInput): Person | Promise<Person>;

    abstract removePerson(id: string): Owner | Promise<Owner>;

    abstract createCatOwner(createOwnerInput: CreateOwnerInput): Owner | Promise<Owner>;

    abstract createOwnerFromId(createOwner: OwnerIdInput): Owner | Promise<Owner>;

    abstract createCatSanctuary(createPetSanctuaryInput: CreatePetSanctuaryInput): PetSanctuary | Promise<PetSanctuary>;

    abstract createAddress(addressInput: AddressInput): Address | Promise<Address>;

    abstract removeAddress(id: string): Address | Promise<Address>;

    abstract updateAddress(id: string, updateAddress: AddressUpdateInput): Address | Promise<Address>;

    abstract createPersonAddress(personId: string, addressId: string): Owner | Promise<Owner>;

    abstract removePersonAddress(personId: string, addressId: string): Owner | Promise<Owner>;

    abstract changePetOwnership(transferPetInput: TransferPetInput): PetSanctuary | Promise<PetSanctuary>;
}

export class Owner {
    id: string;
    name: string;
    addresses: Address[];
    birthdate?: DateTime;
    cats?: Cat[];
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

export class PetSanctuary {
    id: string;
    name: string;
    address: Address;
    catInventory: Cat[];
}

export class PetSanctuaryNHistory {
    id: string;
    name: string;
    address: Address;
}

export abstract class IQuery {
    abstract addresses(queryInput?: AddressQueryInput): Address[] | Promise<Address[]>;

    abstract people(personInput?: PersonInput): Owner[] | Promise<Owner[]>;

    abstract person(id: string): Owner | Promise<Owner>;

    abstract cats(): Cat[] | Promise<Cat[]>;

    abstract cat(id: string): Cat | Promise<Cat>;

    abstract catsWithOwners(): CatOwnerRange[] | Promise<CatOwnerRange[]>;

    abstract catsWithoutOwners(): CatOwnerRange[] | Promise<CatOwnerRange[]>;

    abstract catOwners(): Owner[] | Promise<Owner[]>;

    abstract catSanctuaries(): PetSanctuary[] | Promise<PetSanctuary[]>;
}

export abstract class ISubscription {
    abstract catCreated(): Cat | Promise<Cat>;

    abstract catRemoved(): Cat | Promise<Cat>;

    abstract catUpdated(): Cat | Promise<Cat>;

    abstract catOwnershipChanged(): CatOwnerRange | Promise<CatOwnerRange>;
}

export type DateTime = any;
