import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PetRecord } from './dto';
import { Pet } from './graphql.schema';
import { ListAllEntities } from './model';
import { PetRepoService } from './services/pets-repo.service';
import { MappingService } from './helpers/mapping.service';

@Controller('pets')
export class PetsController {
    @Post()
    create(@Body() createPetDto: PetRecord): Observable<Pet> {

        return this.service.create(createPetDto).pipe(
            map(c => this.mappingService.buildPet(c.id))
        );  // 'This action adds a new pet';
    }

    @Get()
    findAll(@Query() query: ListAllEntities): Observable<Pet[]> {

        return this.service.findAll(query.limit).pipe(
            map(ca => ca.map(c => this.mappingService.buildPet(c.id))));   // `This action returns all pets (limit: ${query.limit} items)`;
    }

    @Get(':id')
    findOne(@Param('id') id: string): Observable<Pet> {
        return this.service.findOneById(id).pipe(
            map(c => this.mappingService.buildPet(c.id))
        );    // `This action returns a #${id} pet`;
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() update: Partial<Pet>): Observable<Pet> {
        return this.service.update(id, update).pipe(
            map(c => this.mappingService.buildPet(c.id))
        );     // `This action updates a #${id} pet`;
    }

    @Delete(':id')
    remove(@Param('id') id: string): Observable<Pet> {
        return this.service.remove(id).pipe(
            map(c => this.mappingService.buildPet(c.id))
        );     // `This action removes a #${id} pet`;
    }

    constructor(private readonly service: PetRepoService,
                private readonly mappingService: MappingService) {}
}
