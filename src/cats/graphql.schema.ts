
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
    name: string;
    address: AddressIdInput[];
    birthdate?: DateTime;
    cats: CatIdInput[];
}

export class CreatePersonInput {
    name: string;
    address: AddressIdInput[];
    birthdate?: DateTime;
}

export class CreatePetSanctuaryInput {
    name: string;
    addressRef: string;
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
    address?: AddressIdInput[];
    birthdate?: DateTime;
    cats?: CatIdInput[];
}

export class PetSanctuaryIdInput {
    id: string;
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
}

export class CatOwnerRange {
    id: string;
    cat: Cat;
    owner?: Owner;
    sanctuary?: PetSanctuary;
    start: DateTime;
    end?: DateTime;
}

export abstract class IMutation {
    abstract createCat(createCatInput?: CreateCatInput): Cat | Promise<Cat>;

    abstract removeCat(id: string): Cat | Promise<Cat>;

    abstract updateCat(id: string, updateCatInput?: UpdateCatInput): Cat | Promise<Cat>;

    abstract createCatOwner(createOwnerInput?: CreateOwnerInput): Owner | Promise<Owner>;

    abstract createOwnerFromId(createOwner?: OwnerIdInput): Owner | Promise<Owner>;

    abstract createCatSanctuary(createPetSanctuaryInput?: CreatePetSanctuaryInput): PetSanctuary | Promise<PetSanctuary>;

    abstract createAddress(addressInput?: AddressInput): Address | Promise<Address>;

    abstract unOwnCat(senctuaryId: string, ownerId: string, catId: string): PetSanctuary | Promise<PetSanctuary>;
}

export class Owner {
    id: string;
    name: string;
    address: Address[];
    birthdate?: DateTime;
    cats: Cat[];
}

export class PetSanctuary {
    id: string;
    name: string;
    address: Address;
    catInventory: Cat[];
}

export abstract class IQuery {
    abstract cats(): Cat[] | Promise<Cat[]>;

    abstract cat(id: string): Cat | Promise<Cat>;

    abstract catsWithOwners(): CatOwnerRange[] | Promise<CatOwnerRange[]>;

    abstract catsWithoutOwners(): CatOwnerRange[] | Promise<CatOwnerRange[]>;

    abstract catOwners(): CatOwnerRange[] | Promise<CatOwnerRange[]>;

    abstract catSanctuaries(): PetSanctuary[] | Promise<PetSanctuary[]>;
}

export abstract class ISubscription {
    abstract catCreated(): Cat | Promise<Cat>;

    abstract catRemoved(): Cat | Promise<Cat>;

    abstract catUpdated(): Cat | Promise<Cat>;
}

export type DateTime = any;
