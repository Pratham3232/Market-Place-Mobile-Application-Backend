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
}
