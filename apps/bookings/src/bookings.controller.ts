import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  getHello(): string {
    return this.bookingsService.getHello();
  }

  @Get('stats')
  getBookingStats(@Query('userId') userId?: string) {
    const userIdNum = userId ? parseInt(userId) : undefined;
    return this.bookingsService.getBookingStats(userIdNum);
  }

  @Get('user-summary/:userId')
  getUserBookingSummary(@Query('userId', ParseIntPipe) userId: number) {
    return this.bookingsService.getUserBookingSummary(userId);
  }

  @Get('provider-summary')
  getProviderBookingSummary(
    @Query('providerId') providerId?: string,
    @Query('businessProviderId') businessProviderId?: string,
    @Query('locationProviderId') locationProviderId?: string
  ) {
    const providerIdNum = providerId ? parseInt(providerId) : undefined;
    const businessProviderIdNum = businessProviderId ? parseInt(businessProviderId) : undefined;
    const locationProviderIdNum = locationProviderId ? parseInt(locationProviderId) : undefined;
    
    return this.bookingsService.getProviderBookingSummary(
      providerIdNum,
      businessProviderIdNum,
      locationProviderIdNum
    );
  }
}
