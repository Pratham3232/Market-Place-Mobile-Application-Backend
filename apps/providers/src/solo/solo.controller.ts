import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, UseGuards } from '@nestjs/common';
import { SoloService } from './solo.service';
import { CreateSoloDto } from './dto/create-solo.dto';
import { UpdateSoloDto } from './dto/update-solo.dto';
import { AuthGuard } from '@app/common';

@Controller('solo')
export class SoloController {
    constructor(private soloService: SoloService) { }
    
    @UseGuards(AuthGuard)
    @Get()
    async getAll(){
        return this.soloService.findAll();
    }

    @UseGuards(AuthGuard)
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
