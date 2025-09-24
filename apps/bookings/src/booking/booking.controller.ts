import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryBookingDto) {
    return this.bookingService.findAll(queryDto);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() queryDto: QueryBookingDto
  ) {
    return this.bookingService.findByUser(userId, queryDto);
  }

  @Get('provider/:providerId')
  findByProvider(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query() queryDto: QueryBookingDto
  ) {
    return this.bookingService.findByProvider(providerId, queryDto);
  }

  @Get('business-provider/:businessProviderId')
  findByBusinessProvider(
    @Param('businessProviderId', ParseIntPipe) businessProviderId: number,
    @Query() queryDto: QueryBookingDto
  ) {
    return this.bookingService.findByBusinessProvider(businessProviderId, queryDto);
  }

  @Get('location-provider/:locationProviderId')
  findByLocationProvider(
    @Param('locationProviderId', ParseIntPipe) locationProviderId: number,
    @Query() queryDto: QueryBookingDto
  ) {
    return this.bookingService.findByLocationProvider(locationProviderId, queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto
  ) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: BookingStatus
  ) {
    return this.bookingService.updateStatus(id, status);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('paymentStatus') paymentStatus: PaymentStatus
  ) {
    return this.bookingService.updatePaymentStatus(id, paymentStatus);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.remove(id);
  }

  // ========== SOLO PROVIDER ENDPOINTS ==========

  @Get('provider/:providerId/sessions')
  getProviderSessions(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query() queryDto: any
  ) {
    return this.bookingService.getProviderSessions(providerId, queryDto);
  }

  @Get('provider/:providerId/upcoming-sessions')
  getUpcomingSessions(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingService.getUpcomingSessions(providerId);
  }

  @Get('provider/:providerId/next-appointment')
  getNextAppointment(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingService.getNextAppointment(providerId);
  }

  @Get('provider/:providerId/recap-pending')
  getRecapPendingSessions(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingService.getRecapPendingSessions(providerId);
  }

  @Get('provider/:providerId/customers')
  getProviderCustomers(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingService.getProviderCustomers(providerId);
  }

  // ========== BUSINESS EMPLOYER ENDPOINTS ==========

  @Get('business/:businessProviderId/employees')
  getBusinessEmployees(@Param('businessProviderId', ParseIntPipe) businessProviderId: number) {
    return this.bookingService.getBusinessEmployees(businessProviderId);
  }

  @Get('business/:businessProviderId/sessions')
  getBusinessSessions(
    @Param('businessProviderId', ParseIntPipe) businessProviderId: number,
    @Query() queryDto: any
  ) {
    return this.bookingService.getBusinessSessions(businessProviderId, queryDto);
  }

  @Get('business/:businessProviderId/schedule')
  getBusinessSchedule(
    @Param('businessProviderId', ParseIntPipe) businessProviderId: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const dateRange = fromDate && toDate ? { fromDate, toDate } : undefined;
    return this.bookingService.getBusinessSchedule(businessProviderId, dateRange);
  }
}
