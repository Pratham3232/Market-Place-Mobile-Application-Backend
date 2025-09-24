import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/common';

export interface MessageData {
  senderId: number;
  receiverId: number;
  message: string;
  bookingId?: number;
}

export interface NotificationData {
  userId: number;
  type: string;
  title: string;
  content: string;
  relatedBookingId?: number;
  metadata?: string;
}

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Send message from provider to parent
   */
  async sendMessageToParent(messageData: MessageData) {
    try {
      // Validate sender is a provider
      const sender = await this.prisma.user.findUnique({
        where: { id: messageData.senderId },
        include: {
          provider: true,
          BusinessProvider: true
        }
      });

      if (!sender || (!sender.provider && !sender.BusinessProvider)) {
        throw new BadRequestException('Sender must be a provider');
      }

      // Validate receiver exists and has parent role
      const receiver = await this.prisma.user.findUnique({
        where: { id: messageData.receiverId },
        include: {
          Parent: true
        }
      });

      if (!receiver) {
        throw new BadRequestException('Receiver not found');
      }

      // Create conversation if it doesn't exist
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          OR: [
            { providerId: sender.provider?.id },
            { businessProviderId: sender.BusinessProvider?.id }
          ]
        }
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            sessionId: `conv_${Date.now()}_${messageData.senderId}_${messageData.receiverId}`,
            providerId: sender.provider?.id,
            businessProviderId: sender.BusinessProvider?.id
          }
        });
      }

      // Create message
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: messageData.message,
          question: `Message from ${sender.name}`
        },
        include: {
          conversation: true
        }
      });

      // Create notification for receiver
      await this.createNotification({
        userId: messageData.receiverId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        content: `You have a new message from ${sender.name}`,
        relatedBookingId: messageData.bookingId,
        metadata: JSON.stringify({ conversationId: conversation.id })
      });

      return message;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to send message');
    }
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Create notification
   */
  async createNotification(notificationData: NotificationData) {
    // Since we don't have a notification table in the schema,
    // we'll create a mock response or use the message system
    // In a real implementation, you'd create a Notification table
    
    return {
      id: Date.now(),
      ...notificationData,
      isRead: false,
      createdAt: new Date()
    };
  }

  /**
   * Get notifications for a user (mock implementation)
   */
  async getUserNotifications(userId: number, page = 1, limit = 10) {
    // Mock notifications based on user's bookings and messages
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        provider: {
          include: {
            user: true
          }
        },
        service: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const notifications = bookings.map(booking => ({
      id: `notif_${booking.id}`,
      type: this.getNotificationTypeFromBooking(booking),
      title: this.getNotificationTitle(booking),
      content: this.getNotificationContent(booking),
      time: booking.updatedAt,
      relatedBookingId: booking.id,
      isRead: false
    }));

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total: notifications.length
      }
    };
  }

  private getNotificationTypeFromBooking(booking: any): string {
    switch (booking.status) {
      case 'CONFIRMED':
        return 'BOOKING_CONFIRMED';
      case 'CANCELLED':
        return 'BOOKING_CANCELLED';
      case 'COMPLETED':
        return 'SESSION_COMPLETED';
      default:
        return 'BOOKING_UPDATE';
    }
  }

  private getNotificationTitle(booking: any): string {
    switch (booking.status) {
      case 'CONFIRMED':
        return 'Booking Confirmed';
      case 'CANCELLED':
        return 'Booking Cancelled';
      case 'COMPLETED':
        return 'Session Completed';
      default:
        return 'Booking Update';
    }
  }

  private getNotificationContent(booking: any): string {
    const providerName = booking.provider?.user?.name || 'Provider';
    const serviceName = booking.service?.name || 'Service';
    
    switch (booking.status) {
      case 'CONFIRMED':
        return `Your booking for ${serviceName} with ${providerName} has been confirmed`;
      case 'CANCELLED':
        return `Your booking for ${serviceName} with ${providerName} has been cancelled`;
      case 'COMPLETED':
        return `Your session for ${serviceName} with ${providerName} has been completed`;
      default:
        return `Your booking for ${serviceName} has been updated`;
    }
  }
}