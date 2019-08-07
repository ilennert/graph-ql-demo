
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class CreateAddressInput {
    street: string;
    city: string;
    state: string;
    zip: string;
}

export class CreateCatInput {
    id?: string;
    name: string;
    age: number;
    breed: string;
}

export class UpdateAddressInput {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
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
    state: string;
    zip: string;
    stateProv: string;
    zipPostal: string;
}

export class Cat {
    id: string;
    name: string;
    age: number;
    breed: string;
}

export class CatWithOwners {
    id: string;
    name: string;
    age: number;
    breed: string;
    ownersRanges: Owner[];
}

export abstract class IMutation {
    abstract createCat(createCatInput?: CreateCatInput): Cat | Promise<Cat>;

    abstract removeCat(id: string): Cat | Promise<Cat>;

    abstract updateCat(id: string, updateCatInput?: UpdateCatInput): Cat | Promise<Cat>;
}

export class Owner {
    id: string;
    name: string;
    address: Address[];
    birthdate: DateTime;
}

export class OwnerRange {
    id: string;
    owner: Owner;
    start: DateTime;
    end: DateTime;
}

export class PetStore {
    id: string;
    name: string;
    address: Address[];
}

export abstract class IQuery {
    abstract cats(): Cat[] | Promise<Cat[]>;

    abstract cat(id: string): Cat | Promise<Cat>;

    abstract catsWithOwners(): CatWithOwners[] | Promise<CatWithOwners[]>;
}

export abstract class ISubscription {
    abstract catCreated(): Cat | Promise<Cat>;

    abstract catRemoved(): Cat | Promise<Cat>;

    abstract catUpdated(): Cat | Promise<Cat>;
}

export type DateTime = any;
