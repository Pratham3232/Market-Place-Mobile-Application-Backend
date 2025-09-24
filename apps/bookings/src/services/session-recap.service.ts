import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { BookingStatus } from '@prisma/client';

export interface SessionRecapData {
  bookingId: number;
  notes: string;
  rating?: number;
  recommendations?: string;
  nextSteps?: string;
  attachments?: string;
}

@Injectable()
export class SessionRecapService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create session recap
   */
  async createSessionRecap(recapData: SessionRecapData, providerId: number) {
    try {
      // Validate booking exists and belongs to provider
      const booking = await this.prisma.booking.findFirst({
        where: {
          id: recapData.bookingId,
          OR: [
            { providerId },
            { 
              provider: {
                businessProviderId: providerId // If it's a business provider
              }
            }
          ],
          status: BookingStatus.COMPLETED
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
        }
      });

      if (!booking) {
        throw new NotFoundException('Completed booking not found for this provider');
      }

      // Since we don't have a SessionRecap table in the schema,
      // we'll store the recap data in a structured way
      // In a real implementation, you'd create a SessionRecap table
      
      const recap = {
        id: `recap_${recapData.bookingId}_${Date.now()}`,
        bookingId: recapData.bookingId,
        providerId,
        clientName: booking.user.name,
        serviceName: booking.service.name,
        sessionDate: booking.bookingTime,
        notes: recapData.notes,
        rating: recapData.rating,
        recommendations: recapData.recommendations,
        nextSteps: recapData.nextSteps,
        attachments: recapData.attachments,
        createdAt: new Date()
      };

      // Update booking to mark recap as completed (you might want to add a field for this)
      await this.prisma.booking.update({
        where: { id: recapData.bookingId },
        data: {
          // You might want to add a recapCompleted field to the schema
          updatedAt: new Date()
        }
      });

      // Create notification for parent
      // In a real implementation, you'd use the notification service
      
      return recap;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create session recap');
    }
  }

  /**
   * Get session recaps for a provider
   */
  async getProviderSessionRecaps(providerId: number, page = 1, limit = 10) {
    // Mock implementation - in reality, you'd query a SessionRecap table
    const completedBookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { providerId },
          { 
            provider: {
              businessProviderId: providerId
            }
          }
        ],
        status: BookingStatus.COMPLETED
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
      orderBy: { bookingTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const recaps = completedBookings.map(booking => ({
      id: `recap_${booking.id}`,
      bookingId: booking.id,
      clientName: booking.user.name,
      serviceName: booking.service.name,
      sessionDate: booking.bookingTime,
      hasRecap: false, // You'd check if recap exists in SessionRecap table
      createdAt: booking.updatedAt
    }));

    return {
      data: recaps,
      meta: {
        page,
        limit,
        total: completedBookings.length
      }
    };
  }

  /**
   * Get session recap details
   */
  async getSessionRecap(bookingId: number, providerId: number) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { providerId },
          { 
            provider: {
              businessProviderId: providerId
            }
          }
        ],
        status: BookingStatus.COMPLETED
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            Child: true
          }
        },
        service: true,
        provider: {
          include: {
            user: true
          }
        }
      }
    });

    if (!booking) {
      throw new NotFoundException('Session recap not found');
    }

    // Mock recap data - in reality, you'd fetch from SessionRecap table
    return {
      id: `recap_${bookingId}`,
      bookingId,
      clientName: booking.user.name,
      serviceName: booking.service.name,
      sessionDate: booking.bookingTime,
      duration: booking.durationMinutes,
      notes: 'Session recap not yet created',
      rating: null,
      recommendations: null,
      nextSteps: null,
      attachments: null,
      createdAt: booking.updatedAt
    };
  }

  /**
   * Update session recap
   */
  async updateSessionRecap(bookingId: number, recapData: Partial<SessionRecapData>, providerId: number) {
    // Validate booking belongs to provider
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { providerId },
          { 
            provider: {
              businessProviderId: providerId
            }
          }
        ],
        status: BookingStatus.COMPLETED
      }
    });

    if (!booking) {
      throw new NotFoundException('Session not found or not completed');
    }

    // Mock update - in reality, you'd update the SessionRecap table
    const updatedRecap = {
      id: `recap_${bookingId}`,
      bookingId,
      ...recapData,
      updatedAt: new Date()
    };

    return updatedRecap;
  }
}