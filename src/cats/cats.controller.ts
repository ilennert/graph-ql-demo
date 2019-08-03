import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { Observable } from 'rxjs';

import { CreateCatDto } from './dto';
import { Cat, ListAllEntities } from './model';
import { CatsRepoService } from './services';

@Controller('cats')
export class CatsController {
    @Post()
    create(@Body() createCatDto: CreateCatDto): Observable<Cat> {

        return this.service.create(createCatDto);  // 'This action adds a new cat';
    }

    @Get()
    findAll(@Query() query: ListAllEntities): Observable<Cat[]> {

        return this.service.findAll(query.limit);   // `This action returns all cats (limit: ${query.limit} items)`;
    }

    @Get(':id')
    findOne(@Param('id') id: string): Observable<Cat> {
        return this.service.findOneById(id);    // `This action returns a #${id} cat`;
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() update: Partial<Cat>): Observable<Cat> {
        return this.service.update(id, update);     // `This action updates a #${id} cat`;
    }

    @Delete(':id')
    remove(@Param('id') id: string): Observable<Cat> {
        return this.service.remove(id);     // `This action removes a #${id} cat`;
    }

    constructor(private readonly service: CatsRepoService) {}
}
