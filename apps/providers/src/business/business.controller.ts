import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SendEmployeeInvitationDto } from './dto/send-employee-invitation.dto';
import { AuthGuard } from '../../../auth/src/guards/auth.guard';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto, createBusinessDto.userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }

  @Post(':id/invite-employee')
  sendEmployeeInvitation(
    @Param('id') id: string,
    @Body() dto: SendEmployeeInvitationDto,
  ) {
    return this.businessService.sendEmployeeInvitation(Number(id), dto);
  }
}
