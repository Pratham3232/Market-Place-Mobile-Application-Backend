import { Controller, Get, Query, ParseIntPipe, Param } from '@nestjs/common';
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

  // ========== SOLO PROVIDER ENDPOINTS ==========

  @Get('provider/:providerId/sessions')
  getProviderSessions(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query() queryDto: any
  ) {
    return this.bookingsService.getProviderSessions(providerId, queryDto);
  }

  @Get('provider/:providerId/upcoming-sessions')
  getUpcomingSessions(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingsService.getUpcomingSessions(providerId);
  }

  @Get('provider/:providerId/next-appointment')
  getNextAppointment(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingsService.getNextAppointment(providerId);
  }

  @Get('provider/:providerId/recap-pending')
  getRecapPendingSessions(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingsService.getRecapPendingSessions(providerId);
  }

  @Get('provider/:providerId/customers')
  getProviderCustomers(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingsService.getProviderCustomers(providerId);
  }

  // ========== BUSINESS EMPLOYER ENDPOINTS ==========

  @Get('business/:businessProviderId/employees')
  getBusinessEmployees(@Param('businessProviderId', ParseIntPipe) businessProviderId: number) {
    return this.bookingsService.getBusinessEmployees(businessProviderId);
  }

  @Get('business/:businessProviderId/sessions')
  getBusinessSessions(
    @Param('businessProviderId', ParseIntPipe) businessProviderId: number,
    @Query() queryDto: any
  ) {
    return this.bookingsService.getBusinessSessions(businessProviderId, queryDto);
  }

  @Get('business/:businessProviderId/schedule')
  getBusinessSchedule(
    @Param('businessProviderId', ParseIntPipe) businessProviderId: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const dateRange = fromDate && toDate ? { fromDate, toDate } : undefined;
    return this.bookingsService.getBusinessSchedule(businessProviderId, dateRange);
  }

  // ========== LOCATION EMPLOYER ENDPOINTS ==========

  @Get('location/:locationProviderId/bookings')
  getLocationBookings(
    @Param('locationProviderId', ParseIntPipe) locationProviderId: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const dateRange = fromDate && toDate ? { fromDate, toDate } : undefined;
    return this.bookingsService.getLocationBookings(locationProviderId, dateRange);
  }

  @Get('location/:locationProviderId/upcoming-sessions')
  getLocationUpcomingSessions(
    @Param('locationProviderId', ParseIntPipe) locationProviderId: number,
  ) {
    return this.bookingsService.getLocationUpcomingSessions(locationProviderId);
  }

  // ========== EARNINGS ENDPOINTS ==========

  @Get('provider/:providerId/earnings')
  getProviderEarnings(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingsService.getProviderEarnings(providerId);
  }

  @Get('earnings/all-providers')
  getAllProvidersEarnings() {
    return this.bookingsService.getAllProvidersEarnings();
  }
}
