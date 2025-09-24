import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { PrismaService } from '@app/common';
import { Booking, BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Validate that the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: createBookingDto.userId }
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Validate that the service exists
      const service = await this.prisma.service.findUnique({
        where: { id: createBookingDto.serviceId }
      });
      if (!service) {
        throw new BadRequestException('Service not found');
      }

      // Validate providers if provided
      if (createBookingDto.providerId) {
        const provider = await this.prisma.provider.findUnique({
          where: { id: createBookingDto.providerId }
        });
        if (!provider) {
          throw new BadRequestException('Provider not found');
        }
      }

      if (createBookingDto.businessProviderId) {
        const businessProvider = await this.prisma.businessProvider.findUnique({
          where: { id: createBookingDto.businessProviderId }
        });
        if (!businessProvider) {
          throw new BadRequestException('Business provider not found');
        }
      }

      if (createBookingDto.locationProviderId) {
        const locationProvider = await this.prisma.locationProvider.findUnique({
          where: { id: createBookingDto.locationProviderId }
        });
        if (!locationProvider) {
          throw new BadRequestException('Location provider not found');
        }
      }

      const booking = await this.prisma.booking.create({
        data: {
          ...createBookingDto,
          bookingTime: new Date(createBookingDto.bookingTime),
          paymentStatus: createBookingDto.paymentStatus || PaymentStatus.PENDING,
          status: createBookingDto.status || BookingStatus.PENDING
        },
        include: {
          user: true,
          service: true,
          provider: true,
          businessProvider: true,
          locationProvider: true,
          payments: true
        }
      });

      return booking;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create booking');
    }
  }

  async findAll(queryDto?: QueryBookingDto) {
    const where: any = {};
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause based on query parameters
    if (queryDto?.userId) where.userId = queryDto.userId;
    if (queryDto?.serviceId) where.serviceId = queryDto.serviceId;
    if (queryDto?.providerId) where.providerId = queryDto.providerId;
    if (queryDto?.businessProviderId) where.businessProviderId = queryDto.businessProviderId;
    if (queryDto?.locationProviderId) where.locationProviderId = queryDto.locationProviderId;
    if (queryDto?.paymentStatus) where.paymentStatus = queryDto.paymentStatus;
    if (queryDto?.status) where.status = queryDto.status;

    // Date range filter
    if (queryDto?.fromDate || queryDto?.toDate) {
      where.bookingTime = {};
      if (queryDto.fromDate) where.bookingTime.gte = new Date(queryDto.fromDate);
      if (queryDto.toDate) where.bookingTime.lte = new Date(queryDto.toDate);
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
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
              description: true,
              pricePerHour: true
            }
          },
          provider: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          businessProvider: {
            select: {
              id: true,
              businessName: true,
              businessEmail: true
            }
          },
          locationProvider: {
            select: {
              id: true,
              locationName: true,
              businessName: true
            }
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.booking.count({ where })
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
        provider: {
          include: {
            user: true
          }
        },
        businessProvider: true,
        locationProvider: true,
        payments: true
      }
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    // Check if booking exists
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id }
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    try {
      const updateData: any = { ...updateBookingDto };
      
      // Convert bookingTime to Date if provided
      if (updateBookingDto.bookingTime) {
        updateData.bookingTime = new Date(updateBookingDto.bookingTime);
      }

      const booking = await this.prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          service: true,
          provider: true,
          businessProvider: true,
          locationProvider: true,
          payments: true
        }
      });

      return booking;
    } catch (error) {
      throw new BadRequestException('Failed to update booking');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    try {
      await this.prisma.booking.delete({
        where: { id }
      });

      return { message: `Booking with ID ${id} has been deleted` };
    } catch (error) {
      throw new BadRequestException('Failed to delete booking');
    }
  }

  // Additional useful methods
  async findByUser(userId: number, queryDto?: QueryBookingDto) {
    return this.findAll({ ...queryDto, userId });
  }

  async findByProvider(providerId: number, queryDto?: QueryBookingDto) {
    return this.findAll({ ...queryDto, providerId });
  }

  async findByBusinessProvider(businessProviderId: number, queryDto?: QueryBookingDto) {
    return this.findAll({ ...queryDto, businessProviderId });
  }

  async findByLocationProvider(locationProviderId: number, queryDto?: QueryBookingDto) {
    return this.findAll({ ...queryDto, locationProviderId });
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    return this.update(id, { status });
  }

  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Booking> {
    return this.update(id, { paymentStatus });
  }

  // ========== SOLO PROVIDER SPECIFIC METHODS ==========
  
  /**
   * Get all sessions (bookings) for a solo provider with detailed information
   */
  async getProviderSessions(providerId: number, queryDto?: any) {
    const where: any = {
      providerId,
      provider: {
        soloProvider: true,
        businessProviderId: null
      }
    };

    if (queryDto?.status) where.status = queryDto.status;
    if (queryDto?.fromDate || queryDto?.toDate) {
      where.bookingTime = {};
      if (queryDto.fromDate) where.bookingTime.gte = new Date(queryDto.fromDate);
      if (queryDto.toDate) where.bookingTime.lte = new Date(queryDto.toDate);
    }

    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const skip = (page - 1) * limit;

    const sessions = await this.prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            Child: {
              select: {
                id: true,
                name: true,
                dateOfBirth: true
              }
            }
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            pricePerHour: true
          }
        },
        provider: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: { 
        [queryDto?.sortBy || 'bookingTime']: queryDto?.sortOrder || 'asc' 
      }
    });

    // Calculate child ages and format response
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      name: session.user.name,
      service: session.service.name,
      childDetails: session.user.Child.map(child => ({
        name: child.name,
        age: this.calculateAge(child.dateOfBirth)
      })),
      location: `${session.provider?.address}, ${session.provider?.city}, ${session.provider?.state}`,
      time: session.bookingTime,
      duration: session.durationMinutes,
      status: session.status,
      totalPrice: session.totalPrice
    }));

    const total = await this.prisma.booking.count({ where });

    return {
      data: formattedSessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get upcoming sessions for a provider
   */
  async getUpcomingSessions(providerId: number) {
    const now = new Date();
    return this.getProviderSessions(providerId, {
      fromDate: now.toISOString(),
      status: BookingStatus.CONFIRMED,
      sortBy: 'bookingTime',
      sortOrder: 'asc',
      limit: 5
    });
  }

  /**
   * Get next appointment for a provider
   */
  async getNextAppointment(providerId: number) {
    const now = new Date();
    const nextAppointment = await this.prisma.booking.findFirst({
      where: {
        providerId,
        bookingTime: {
          gte: now
        },
        status: BookingStatus.CONFIRMED,
        provider: {
          soloProvider: true,
          businessProviderId: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        bookingTime: 'asc'
      }
    });

    return nextAppointment ? {
      name: nextAppointment.user.name,
      service: nextAppointment.service.name,
      time: nextAppointment.bookingTime,
      duration: nextAppointment.durationMinutes
    } : null;
  }

  /**
   * Get sessions requiring recap
   */
  async getRecapPendingSessions(providerId: number) {
    const completedSessions = await this.prisma.booking.findMany({
      where: {
        providerId,
        status: BookingStatus.COMPLETED,
        provider: {
          soloProvider: true,
          businessProviderId: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        bookingTime: 'desc'
      }
    });

    // Filter sessions that don't have recaps (you might want to add a recap table)
    return completedSessions.map(session => ({
      bookingId: session.id,
      clientName: session.user.name,
      service: session.service.name,
      completedDate: session.bookingTime
    }));
  }

  /**
   * Get customers/clients for a provider
   */
  async getProviderCustomers(providerId: number) {
    const customers = await this.prisma.booking.groupBy({
      by: ['userId'],
      where: {
        providerId,
        provider: {
          soloProvider: true,
          businessProviderId: null
        }
      },
      _count: {
        id: true
      }
    });

    const customerDetails = await Promise.all(
      customers.map(async (customer) => {
        const user = await this.prisma.user.findUnique({
          where: { id: customer.userId },
          include: {
            Child: {
              select: {
                id: true,
                name: true,
                dateOfBirth: true
              }
            }
          }
        });

        const lastBooking = await this.prisma.booking.findFirst({
          where: {
            userId: customer.userId,
            providerId
          },
          orderBy: {
            bookingTime: 'desc'
          },
          include: {
            service: {
              select: {
                name: true
              }
            }
          }
        });

        return {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          phoneNumber: user?.phoneNumber,
          children: user?.Child?.map(child => ({
            name: child.name,
            age: this.calculateAge(child.dateOfBirth)
          })),
          totalBookings: customer._count.id,
          lastService: lastBooking?.service.name,
          lastBookingDate: lastBooking?.bookingTime
        };
      })
    );

    return customerDetails;
  }

  // ========== BUSINESS EMPLOYER SPECIFIC METHODS ==========

  /**
   * Get employee list for a business provider
   */
  async getBusinessEmployees(businessProviderId: number) {
    const employees = await this.prisma.provider.findMany({
      where: {
        businessProviderId,
        soloProvider: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        availability: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true
          }
        }
      }
    });

    const employeeDetails = await Promise.all(
      employees.map(async (employee) => {
        const sessionsCount = await this.prisma.booking.count({
          where: {
            providerId: employee.id,
            status: BookingStatus.COMPLETED
          }
        });

        return {
          id: employee.id,
          name: employee.user.name,
          email: employee.user.email,
          phoneNumber: employee.user.phoneNumber,
          role: 'Employee', // You might want to add a role field
          servicesProvided: employee.services,
          availability: employee.availability,
          sessionsCompleted: sessionsCount,
          isActive: employee.isActive
        };
      })
    );

    return employeeDetails;
  }

  /**
   * Get session list for business employer
   */
  async getBusinessSessions(businessProviderId: number, queryDto?: any) {
    const where: any = {
      businessProviderId
    };

    if (queryDto?.status) where.status = queryDto.status;
    if (queryDto?.fromDate || queryDto?.toDate) {
      where.bookingTime = {};
      if (queryDto.fromDate) where.bookingTime.gte = new Date(queryDto.fromDate);
      if (queryDto.toDate) where.bookingTime.lte = new Date(queryDto.toDate);
    }

    const sessions = await this.prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            Child: {
              select: {
                name: true,
                dateOfBirth: true
              }
            }
          }
        },
        provider: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        service: {
          select: {
            name: true
          }
        },
        locationProvider: {
          select: {
            locationName: true,
            address: true
          }
        }
      },
      orderBy: {
        bookingTime: queryDto?.sortOrder === 'desc' ? 'desc' : 'asc'
      }
    });

    return sessions.map(session => ({
      id: session.id,
      childName: session.user.Child?.[0]?.name || 'N/A',
      childAge: session.user.Child?.[0] ? this.calculateAge(session.user.Child[0].dateOfBirth) : null,
      assignee: session.provider?.user.name,
      service: session.service.name,
      location: session.locationProvider ? 
        `${session.locationProvider.locationName}, ${session.locationProvider.address}` : 
        'Provider Location',
      time: session.bookingTime,
      duration: session.durationMinutes,
      status: session.status
    }));
  }

  /**
   * Get business schedule (all employees' schedules)
   */
  async getBusinessSchedule(businessProviderId: number, dateRange?: { fromDate: string, toDate: string }) {
    const where: any = {
      businessProviderId
    };

    if (dateRange) {
      where.bookingTime = {};
      if (dateRange.fromDate) where.bookingTime.gte = new Date(dateRange.fromDate);
      if (dateRange.toDate) where.bookingTime.lte = new Date(dateRange.toDate);
    }

    const schedule = await this.prisma.booking.findMany({
      where,
      include: {
        provider: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        bookingTime: 'asc'
      }
    });

    return schedule.map(booking => ({
      time: booking.bookingTime,
      duration: booking.durationMinutes,
      service: booking.service.name,
      assignee: booking.provider?.user.name,
      status: booking.status
    }));
  }

  // Helper method to calculate age
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // ========== LOCATION EMPLOYER SPECIFIC METHODS ==========
  
  /**
   * Get bookings for a location provider
   */
  async getLocationBookings(locationProviderId: number, dateRange?: { fromDate: string, toDate: string }) {
    const where: any = {
      locationProviderId
    };
    if (dateRange) {
      where.bookingTime = {};
      if (dateRange.fromDate) where.bookingTime.gte = new Date(dateRange.fromDate);
      if (dateRange.toDate) where.bookingTime.lte = new Date(dateRange.toDate);
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            Child: {
              select: {
                name: true,
                dateOfBirth: true
              }
            }
          }
        },
        provider: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        service: {
          select: {
            name: true
          }
        },
        locationProvider: {
          select: {
            locationName: true,
            address: true
          }
        }
      },
      orderBy: {
        bookingTime: 'asc'
      }
    });

    return bookings.map(booking => ({
      id: booking.id,
      childName: booking.user.Child?.[0]?.name || 'N/A',
      childAge: booking.user.Child?.[0] ? this.calculateAge(booking.user.Child[0].dateOfBirth) : null,
      assignee: booking.provider?.user.name,
      service: booking.service.name,
      location: booking.locationProvider ?
        `${booking.locationProvider.locationName}, ${booking.locationProvider.address}` :
        'Provider Location',
      time: booking.bookingTime,
      duration: booking.durationMinutes,
      status: booking.status
    }));
  }
}
