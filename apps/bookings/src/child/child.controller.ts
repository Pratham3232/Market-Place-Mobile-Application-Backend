import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { Transform } from 'class-transformer';

@Controller('child')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Post()
  create(@Body() createChildDto: CreateChildDto) {
    return this.childService.create(createChildDto);
  }

  @Get()
  findAll() {
    return this.childService.findAll();
  }

  @Get('by-user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.childService.findByUserId(userId);
  }

  @Get('by-age')
  findByAge(
    @Query('minAge') minAge?: string,
    @Query('maxAge') maxAge?: string
  ) {
    const minAgeNum = minAge ? parseInt(minAge) : undefined;
    const maxAgeNum = maxAge ? parseInt(maxAge) : undefined;
    return this.childService.findByAge(minAgeNum, maxAgeNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.childService.findOne(id);
  }

  @Get(':id/with-age')
  getChildWithAge(@Param('id', ParseIntPipe) id: number) {
    return this.childService.getChildWithAge(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChildDto: UpdateChildDto
  ) {
    return this.childService.update(id, updateChildDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.childService.remove(id);
  }
}
