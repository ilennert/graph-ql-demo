
export class CreatePetDto {
    readonly id?: string;
    readonly name: string;
    readonly age: number;
    readonly breed: string;

    constructor(
        name: string,
        age: number,
        breed: string,
        id?: string
    ) {
        this.name = name;
        this.age = age;
        this.breed = breed;
        this.id = id;
    }
}
