import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SendEmployeeInvitationDto } from './dto/send-employee-invitation.dto';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto, createBusinessDto.userId);
  }

  @Get()
  findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Get('invite-link/:id')
  getInviteLink(@Param('id') id: string) {
    return this.businessService.getInviteLink(id);
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

  /**
   * Add multiple employees to a business. Expects body: { businessId: number, employees: Array<{userData, serviceData, availabilityData}> }
   */
  @Post('add-employee')
  addEmployeeToBusiness(
    @Body() body: { businessId: number, employees: Array<any> },
  ) {
    return this.businessService.addEmployeeToBusiness(body.businessId, body.employees);
  }

  /**
   * Verify onboarding link for employee
   */
  @Get('verify-onboarding/:token')
  async verifyOnboardingLink(@Param('token') token: string) {
    return this.businessService.verifyOnboardingLink(token);
  }

  /**
   * Onboard employee using onboarding link (token)
   * Expects body: { token: string, userData, serviceData, availabilityData }
   */
  @Post('onboard-employee')
  async onboardEmployeeViaLink(@Body() body: { token: string, userData: any, serviceData: any, availabilityData: any }) {
    return this.businessService.onboardEmployeeViaLink(body.token, body.userData, body.serviceData, body.availabilityData);
  }
}
