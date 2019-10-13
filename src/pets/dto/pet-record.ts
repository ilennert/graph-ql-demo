
export class PetRecord {
    readonly id?: string;
    readonly name: string;
    readonly age: number;
    readonly breed: string;
    readonly species: string;

    constructor(
        name: string,
        age: number,
        breed: string,
        species: string,
        id?: string
    ) {
        this.name = name;
        this.age = age;
        this.breed = breed;
        this.species = species;
        this.id = id;
    }
}
