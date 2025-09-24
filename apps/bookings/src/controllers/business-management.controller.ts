import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export interface CreateEmployeeDto {
  businessProviderId: number;
  name: string;
  email: string;
  phoneNumber: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  pronouns?: 'HE_HIM' | 'SHE_HER' | 'THEY_THEM' | 'OTHER';
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

@Controller('business-management')
export class BusinessManagementController {
  constructor(private readonly prisma: PrismaService) {}

  // ========== EMPLOYEE MANAGEMENT ENDPOINTS ==========

  @Post('employees')
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      // Validate business provider exists
      const businessProvider = await this.prisma.businessProvider.findUnique({
        where: { id: createEmployeeDto.businessProviderId }
      });

      if (!businessProvider) {
        throw new BadRequestException('Business provider not found');
      }

      // Create user first
      const user = await this.prisma.user.create({
        data: {
          phoneNumber: createEmployeeDto.phoneNumber,
          name: createEmployeeDto.name,
          email: createEmployeeDto.email,
          gender: createEmployeeDto.gender,
          pronouns: createEmployeeDto.pronouns,
          roles: ['BUSINESS_EMPLOYEE']
        }
      });

      // Create provider entry
      const provider = await this.prisma.provider.create({
        data: {
          userId: user.id,
          businessProviderId: createEmployeeDto.businessProviderId,
          soloProvider: false,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      });

      return provider;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create employee');
    }
  }

  @Patch('employees/:employeeId')
  async updateEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ) {
    try {
      // Validate employee exists
      const employee = await this.prisma.provider.findFirst({
        where: {
          id: employeeId,
          soloProvider: false
        }
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Update user info
      if (updateEmployeeDto.name || updateEmployeeDto.email || updateEmployeeDto.phoneNumber) {
        await this.prisma.user.update({
          where: { id: employee.userId },
          data: {
            name: updateEmployeeDto.name,
            email: updateEmployeeDto.email,
            phoneNumber: updateEmployeeDto.phoneNumber
          }
        });
      }

      // Update provider info
      const updatedEmployee = await this.prisma.provider.update({
        where: { id: employeeId },
        data: {
          isActive: updateEmployeeDto.isActive
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      });

      return updatedEmployee;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update employee');
    }
  }

  @Delete('employees/:employeeId')
  async deleteEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    try {
      const employee = await this.prisma.provider.findFirst({
        where: {
          id: employeeId,
          soloProvider: false
        }
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Check if employee has active bookings
      const activeBookings = await this.prisma.booking.count({
        where: {
          providerId: employeeId,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      if (activeBookings > 0) {
        throw new BadRequestException('Cannot delete employee with active bookings');
      }

      // Soft delete - set as inactive
      await this.prisma.provider.update({
        where: { id: employeeId },
        data: { isActive: false }
      });

      return { message: 'Employee deactivated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete employee');
    }
  }

  @Get('employees/:employeeId/schedule')
  async getEmployeeSchedule(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const where: any = { providerId: employeeId };

    if (fromDate || toDate) {
      where.bookingTime = {};
      if (fromDate) where.bookingTime.gte = new Date(fromDate);
      if (toDate) where.bookingTime.lte = new Date(toDate);
    }

    const schedule = await this.prisma.booking.findMany({
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
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: { bookingTime: 'asc' }
    });

    return schedule.map(booking => ({
      id: booking.id,
      clientName: booking.user.name,
      childName: booking.user.Child?.[0]?.name || 'N/A',
      service: booking.service.name,
      time: booking.bookingTime,
      duration: booking.durationMinutes,
      status: booking.status
    }));
  }

  @Get('employees/:employeeId/performance')
  async getEmployeePerformance(@Param('employeeId', ParseIntPipe) employeeId: number) {
    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      averageRating,
      totalRevenue
    ] = await Promise.all([
      this.prisma.booking.count({
        where: { providerId: employeeId }
      }),
      this.prisma.booking.count({
        where: { 
          providerId: employeeId,
          status: 'COMPLETED'
        }
      }),
      this.prisma.booking.count({
        where: { 
          providerId: employeeId,
          status: 'CANCELLED'
        }
      }),
      // Mock rating - you'd calculate this from session recaps
      4.5,
      this.prisma.booking.aggregate({
        where: {
          providerId: employeeId,
          status: 'COMPLETED'
        },
        _sum: {
          totalPrice: true
        }
      })
    ]);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
      averageRating,
      totalRevenue: totalRevenue._sum.totalPrice || 0
    };
  }
}