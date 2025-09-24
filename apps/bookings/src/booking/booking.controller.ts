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
}
