import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CatRecord } from './dto';
import { Cat } from './graphql.schema';
import { ListAllEntities } from './model';
import { CatRepoService } from './services/cats-repo.service';
import { MappingService } from './helpers/mapping.service';

@Controller('cats')
export class CatsController {
    @Post()
    create(@Body() createCatDto: CatRecord): Observable<Cat> {

        return this.service.create(createCatDto).pipe(
            map(c => this.mappingService.buildCat(c.id))
        );  // 'This action adds a new cat';
    }

    @Get()
    findAll(@Query() query: ListAllEntities): Observable<Cat[]> {

        return this.service.findAll(query.limit).pipe(
            map(ca => ca.map(c => this.mappingService.buildCat(c.id))));   // `This action returns all cats (limit: ${query.limit} items)`;
    }

    @Get(':id')
    findOne(@Param('id') id: string): Observable<Cat> {
        return this.service.findOneById(id).pipe(
            map(c => this.mappingService.buildCat(c.id))
        );    // `This action returns a #${id} cat`;
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() update: Partial<Cat>): Observable<Cat> {
        return this.service.update(id, update).pipe(
            map(c => this.mappingService.buildCat(c.id))
        );     // `This action updates a #${id} cat`;
    }

    @Delete(':id')
    remove(@Param('id') id: string): Observable<Cat> {
        return this.service.remove(id).pipe(
            map(c => this.mappingService.buildCat(c.id))
        );     // `This action removes a #${id} cat`;
    }

    constructor(private readonly service: CatRepoService,
                private readonly mappingService: MappingService) {}
}
