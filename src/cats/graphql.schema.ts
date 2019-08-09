
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

export class CatOwnedRange {
    id: string;
    ownerRanges: OwnerRange[];
}

export class CatWithOwners implements Cat {
    id: string;
    name: string;
    age: number;
    breed: string;
    ownersRanges: OwnerRange[];
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

export class Owner implements Person {
    id: string;
    name: string;
    address: Address[];
    birthdate?: DateTime;
    cats: Cat[];
}

export class OwnerRange {
    id: string;
    owner: Owner;
    start: DateTime;
    end: DateTime;
}

export class Person {
    id: string;
    name: string;
    address: Address[];
    birthdate?: DateTime;
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

    abstract catsWithOwners(): CatWithOwners[] | Promise<CatWithOwners[]>;

    abstract catsWithoutOwners(): CatWithOwners[] | Promise<CatWithOwners[]>;

    abstract catOwners(): OwnerRange[] | Promise<OwnerRange[]>;

    abstract catSanctuaries(): PetSanctuary[] | Promise<PetSanctuary[]>;
}

export abstract class ISubscription {
    abstract catCreated(): Cat | Promise<Cat>;

    abstract catRemoved(): Cat | Promise<Cat>;

    abstract catUpdated(): Cat | Promise<Cat>;
}

export type DateTime = any;
