import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateLocationServiceDto, CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { AuthGuard } from '@app/common';

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

  @Post('locations')
  async createForLocations(@Body() body: CreateLocationServiceDto[]) {
    return this.servicesService.createForLocations(body);
  }

  @Post('availability')
  async createAvailability(@Body() body: CreateAvailabilityDto[]) {
    return this.servicesService.createAvailability(body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id/:serviceProvider')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @Param('serviceProvider') serviceProvider: string) {
    return this.servicesService.findAllProviderService(id, serviceProvider);
  }

  @Get('location/:id')
  @UseGuards(AuthGuard)
  async findLocation(@Param('id') id: string) {
    return this.servicesService.findLocationService(id);
  }

  @Get('availability')
  @UseGuards(AuthGuard)
  async findAllAvailability() {
    return this.servicesService.findAllAvailability();
  }

  @Get('availability/:id/:serviceProvider')
  @UseGuards(AuthGuard)
  async findAvailability(@Param('id') id: string, @Param('serviceProvider') serviceProvider: string) {
    return this.servicesService.findAvailability(id, serviceProvider);
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
