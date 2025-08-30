import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { SoloService } from './solo.service';
import { CreateSoloDto } from './dto/create-solo.dto';
import { UpdateSoloDto } from './dto/update-solo.dto';

@Controller('solo')
export class SoloController {
    constructor(private soloService: SoloService) { }
    
    @Get()
    async getAll(){
        return this.soloService.findAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.soloService.findOne(id);
    }

    @Post()
    async create(@Body() createSoloDto: CreateSoloDto) {
        return this.soloService.create(createSoloDto, createSoloDto.userId);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateSoloDto: UpdateSoloDto) {
        return this.soloService.update(id, updateSoloDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.soloService.delete(id);
    }
}
