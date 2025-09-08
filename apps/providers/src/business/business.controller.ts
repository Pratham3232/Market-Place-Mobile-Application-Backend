import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { AuthGuard, RolesGuard, Roles } from '@app/common';
import { AccessBasedRole } from '@prisma/client';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AccessBasedRole.BUSINESS_PROVIDER)
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto, createBusinessDto.userId);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AccessBasedRole.BUSINESS_PROVIDER)
  findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AccessBasedRole.BUSINESS_PROVIDER)
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AccessBasedRole.BUSINESS_PROVIDER)
  update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AccessBasedRole.BUSINESS_PROVIDER)
  remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }
}
