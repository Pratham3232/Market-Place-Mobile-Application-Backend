import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PrismaService } from '@app/common';
import { Payment, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      // Check if booking exists
      const booking = await this.prisma.booking.findUnique({
        where: { id: createPaymentDto.bookingId }
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      // Check if payment with same ID or transaction ID already exists
      const existingPaymentById = await this.prisma.payment.findUnique({
        where: { id: createPaymentDto.id }
      });

      if (existingPaymentById) {
        throw new ConflictException('Payment with this ID already exists');
      }

      const existingPaymentByTransaction = await this.prisma.payment.findUnique({
        where: { transactionId: createPaymentDto.transactionId }
      });

      if (existingPaymentByTransaction) {
        throw new ConflictException('Payment with this transaction ID already exists');
      }

      const payment = await this.prisma.payment.create({
        data: {
          ...createPaymentDto,
          paymentStatus: createPaymentDto.paymentStatus || PaymentStatus.PENDING
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  pricePerHour: true
                }
              }
            }
          }
        }
      });

      // Update booking payment status if payment is successful
      if (payment.paymentStatus === PaymentStatus.PAID) {
        await this.prisma.booking.update({
          where: { id: createPaymentDto.bookingId },
          data: { paymentStatus: PaymentStatus.PAID }
        });
      }

      return payment;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create payment');
    }
  }

  async findAll(queryDto?: QueryPaymentDto) {
    const where: any = {};
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause based on query parameters
    if (queryDto?.bookingId) where.bookingId = queryDto.bookingId;
    if (queryDto?.paymentStatus) where.paymentStatus = queryDto.paymentStatus;
    if (queryDto?.paymentMethod) where.paymentMethod = queryDto.paymentMethod;
    if (queryDto?.currency) where.currency = queryDto.currency;
    if (queryDto?.transactionId) where.transactionId = queryDto.transactionId;

    // Date range filter
    if (queryDto?.fromDate || queryDto?.toDate) {
      where.createdAt = {};
      if (queryDto.fromDate) where.createdAt.gte = new Date(queryDto.fromDate);
      if (queryDto.toDate) where.createdAt.lte = new Date(queryDto.toDate);
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  pricePerHour: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.payment.count({ where })
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            service: true,
            provider: true,
            businessProvider: true,
            locationProvider: true
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByBooking(bookingId: number): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { bookingId },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true
              }
            },
            service: {
              select: {
                id: true,
                name: true,
                pricePerHour: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { transactionId },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true
              }
            },
            service: {
              select: {
                id: true,
                name: true,
                pricePerHour: true
              }
            }
          }
        }
      }
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    // Check if payment exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    try {
      const payment = await this.prisma.payment.update({
        where: { id },
        data: updatePaymentDto,
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  pricePerHour: true
                }
              }
            }
          }
        }
      });

      // Update booking payment status if payment status changed
      if (updatePaymentDto.paymentStatus) {
        await this.prisma.booking.update({
          where: { id: existingPayment.bookingId },
          data: { paymentStatus: updatePaymentDto.paymentStatus }
        });
      }

      return payment;
    } catch (error) {
      throw new BadRequestException('Failed to update payment');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    try {
      await this.prisma.payment.delete({
        where: { id }
      });

      return { message: `Payment with ID ${id} has been deleted` };
    } catch (error) {
      throw new BadRequestException('Failed to delete payment');
    }
  }

  // Additional useful methods
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Payment> {
    return this.update(id, { paymentStatus });
  }

  async getPaymentStats(queryDto?: QueryPaymentDto) {
    const where: any = {};

    // Build where clause for stats
    if (queryDto?.bookingId) where.bookingId = queryDto.bookingId;
    if (queryDto?.paymentMethod) where.paymentMethod = queryDto.paymentMethod;
    if (queryDto?.currency) where.currency = queryDto.currency;

    // Date range filter
    if (queryDto?.fromDate || queryDto?.toDate) {
      where.createdAt = {};
      if (queryDto.fromDate) where.createdAt.gte = new Date(queryDto.fromDate);
      if (queryDto.toDate) where.createdAt.lte = new Date(queryDto.toDate);
    }

    const stats = await this.prisma.payment.groupBy({
      by: ['paymentStatus'],
      where,
      _count: true,
      _sum: {
        amount: true
      }
    });

    const totalStats = await this.prisma.payment.aggregate({
      where,
      _count: true,
      _sum: {
        amount: true
      }
    });

    return {
      byStatus: stats,
      total: totalStats
    };
  }
}
