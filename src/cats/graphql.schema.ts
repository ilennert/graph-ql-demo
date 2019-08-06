
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class CreateCatInput {
    id?: string;
    name: string;
    age: number;
    breed: string;
}

export class UpdateCatInput {
    name?: string;
    age?: number;
    breed?: string;
}

export class Cat {
    id: string;
    name: string;
    age: number;
    breed: string;
}

export abstract class IMutation {
    abstract createCat(createCatInput?: CreateCatInput): Cat | Promise<Cat>;

    abstract removeCat(id: string): Cat | Promise<Cat>;

    abstract updateCat(id: string, updateCatInput?: UpdateCatInput): Cat | Promise<Cat>;
}

export abstract class IQuery {
    abstract cats(): Cat[] | Promise<Cat[]>;

    abstract cat(id: string): Cat | Promise<Cat>;
}

export abstract class ISubscription {
    abstract catCreated(): Cat | Promise<Cat>;

    abstract catRemoved(): Cat | Promise<Cat>;

    abstract catUpdated(): Cat | Promise<Cat>;
}
