import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async createConversation(sessionId: string, providerId?: number, businessProviderId?: number, locationProviderId?: number) {
    return this.prisma.conversation.create({
      data: {
        sessionId,
        ...(providerId && { providerId }),
        ...(businessProviderId && { businessProviderId }),
        ...(locationProviderId && { locationProviderId }),
      },
    });
  }

  async getConversationWithMessages(sessionId: string) {
    return this.prisma.conversation.findUnique({
      where: { sessionId },
      include: {
        messages: true,
        provider: true,
        businessProvider: true,
        locationProvider: true,
      },
    });
  }

  async getConversationsByProvider(
    providerId?: number,
    businessProviderId?: number,
    locationProviderId?: number,
  ) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { providerId: providerId },
          { businessProviderId: businessProviderId },
          { locationProviderId: locationProviderId },
        ],
      },
      include: {
        messages: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async addMessage(
    conversationId: number,
    data: {
      question?: string;
      content: string;
      audioUrl?: string;
      videoUrl?: string;
    },
  ) {
    const { question, content, audioUrl, videoUrl } = data;
    
    return this.prisma.message.create({
      data: {
        conversationId,
        question,
        content,
        audioUrl,
        videoUrl,
      },
    });
  }

  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}