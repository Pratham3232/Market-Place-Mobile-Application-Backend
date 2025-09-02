import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateLocationServiceDto, CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(@Body() body: CreateServiceDto[]) {
    return this.servicesService.create(body);
  }

  @Post('location')
  async createForLocation(@Body() body: CreateLocationServiceDto) {
    return this.servicesService.createForLocation(body);
  }

  @Post('availability')
  async createAvailability(@Body() body: CreateAvailabilityDto[]) {
    return this.servicesService.createAvailability(body);
  }

  // @Post()
  // async create(@Body() createServiceDto: CreateServiceDto) {
  //   return this.servicesService.create(createServiceDto);
  // }

  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
