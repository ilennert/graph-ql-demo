
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export interface CreateCatInput {
    id?: string;
    name: string;
    age: number;
    breed: string;
}

export interface UpdateCatInput {
    name?: string;
    age?: number;
    breed?: string;
}

export interface Cat {
    id: string;
    name: string;
    age: number;
    breed: string;
}

export interface IMutation {
    createCat(createCatInput?: CreateCatInput): Cat | Promise<Cat>;
    removeCat(id: string): Cat | Promise<Cat>;
    updateCat(id: string, updateCatInput?: UpdateCatInput): Cat | Promise<Cat>;
}

export interface IQuery {
    getCats(): Cat[] | Promise<Cat[]>;
    cat(id: string): Cat | Promise<Cat>;
}

export interface ISubscription {
    catCreated(): Cat | Promise<Cat>;
    catRemoved(): Cat | Promise<Cat>;
    catUpdated(): Cat | Promise<Cat>;
}
