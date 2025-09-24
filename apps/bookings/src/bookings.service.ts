import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { BookingService } from './booking/booking.service';
import { PaymentService } from './payment/payment.service';
import { ParentService } from './parent/parent.service';
import { ChildService } from './child/child.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private parentService: ParentService,
    private childService: ChildService
  ) {}

  getHello(): string {
    return 'Bookings Service is running!';
  }

  // Aggregate methods for dashboard/analytics
  async getBookingStats(userId?: number) {
    const where = userId ? { userId } : {};

    const stats = await this.prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        totalPrice: true
      }
    });

    const totalBookings = await this.prisma.booking.count({ where });
    const totalRevenue = await this.prisma.booking.aggregate({
      where,
      _sum: {
        totalPrice: true
      }
    });

    return {
      byStatus: stats,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0
    };
  }

  async getUserBookingSummary(userId: number) {
    const [bookings, payments, children, parents] = await Promise.all([
      this.bookingService.findByUser(userId, { limit: 5 }),
      this.prisma.payment.findMany({
        where: {
          booking: {
            userId
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      this.childService.findByUserId(userId),
      this.parentService.findByUserId(userId)
    ]);

    return {
      recentBookings: bookings.data,
      recentPayments: payments,
      children,
      parents,
      summary: {
        totalBookings: bookings.meta.total,
        totalChildren: children.length,
        totalParents: parents.length
      }
    };
  }

  async getProviderBookingSummary(providerId?: number, businessProviderId?: number, locationProviderId?: number) {
    const where: any = {};
    if (providerId) where.providerId = providerId;
    if (businessProviderId) where.businessProviderId = businessProviderId;
    if (locationProviderId) where.locationProviderId = locationProviderId;

    const [bookings, revenue] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      this.prisma.booking.aggregate({
        where,
        _sum: {
          totalPrice: true
        }
      })
    ]);

    return {
      bookingsByStatus: bookings,
      totalRevenue: revenue._sum.totalPrice || 0
    };
  }

  // ========== SOLO PROVIDER SPECIFIC METHODS ==========
  
  /**
   * Get all sessions (bookings) for a solo provider with detailed information
   */
  async getProviderSessions(providerId: number, queryDto?: any) {
    return this.bookingService.getProviderSessions(providerId, queryDto);
  }

  /**
   * Get upcoming sessions for a provider
   */
  async getUpcomingSessions(providerId: number) {
    return this.bookingService.getUpcomingSessions(providerId);
  }

  /**
   * Get next appointment for a provider
   */
  async getNextAppointment(providerId: number) {
    return this.bookingService.getNextAppointment(providerId);
  }

  /**
   * Get sessions requiring recap
   */
  async getRecapPendingSessions(providerId: number) {
    return this.bookingService.getRecapPendingSessions(providerId);
  }

  /**
   * Get customers/clients for a provider
   */
  async getProviderCustomers(providerId: number) {
    return this.bookingService.getProviderCustomers(providerId);
  }

  // ========== BUSINESS EMPLOYER SPECIFIC METHODS ==========

  /**
   * Get employee list for a business provider
   */
  async getBusinessEmployees(businessProviderId: number) {
    return this.bookingService.getBusinessEmployees(businessProviderId);
  }

  /**
   * Get session list for business employer
   */
  async getBusinessSessions(businessProviderId: number, queryDto?: any) {
    return this.bookingService.getBusinessSessions(businessProviderId, queryDto);
  }

  /**
   * Get business schedule (all employees' schedules)
   */
  async getBusinessSchedule(businessProviderId: number, dateRange?: { fromDate: string, toDate: string }) {
    return this.bookingService.getBusinessSchedule(businessProviderId, dateRange);
  }

  // ========== LOCATION EMPLOYER SPECIFIC METHODS ==========
  
  /**
   * Get bookings for a location provider
   */
  async getLocationBookings(locationProviderId: number, dateRange?: { fromDate: string, toDate: string }) {
    return this.bookingService.getLocationBookings(locationProviderId, dateRange);
  }

  /**
   * Get upcoming sessions for a location provider
   */
  async getLocationUpcomingSessions(locationProviderId: number) {
    return this.bookingService.getLocationUpcomingSessions(locationProviderId);
  }

  // ========== PROVIDER EARNINGS METHODS ==========
  
  /**
   * Get total earnings for a specific provider
   */
  async getProviderEarnings(providerId: number) {
    return this.bookingService.getProviderEarnings(providerId);
  }

  /**
   * Get total earnings for all providers
   */
  async getAllProvidersEarnings() {
    return this.bookingService.getAllProvidersEarnings();
  }
}
