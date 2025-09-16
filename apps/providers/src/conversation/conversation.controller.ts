import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
// import { AuthGuard } from '@app/common';

@Controller('conversations')
// @UseGuards(AuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async createConversation(
    @Body() body: {
      sessionId: string;
      providerId?: number;
      businessProviderId?: number;
      locationProviderId?: number;
    },
  ) {
    const { sessionId, providerId, businessProviderId, locationProviderId } = body;
    return this.conversationService.createConversation(
      sessionId,
      providerId,
      businessProviderId,
      locationProviderId,
    );
  }

  @Get('provider/:providerId')
  async getConversationsByProvider(
    @Param('providerId') providerId: string,
  ) {
    return this.conversationService.getConversationsByProvider(
      Number(providerId),
      undefined,
      undefined,
    );
  }

  @Get('business/:businessProviderId')
  async getConversationsByBusinessProvider(
    @Param('businessProviderId') businessProviderId: string,
  ) {
    return this.conversationService.getConversationsByProvider(
      undefined,
      Number(businessProviderId),
      undefined,
    );
  }

  @Get('location/:locationProviderId')
  async getConversationsByLocationProvider(
    @Param('locationProviderId') locationProviderId: string,
  ) {
    return this.conversationService.getConversationsByProvider(
      undefined,
      undefined,
      Number(locationProviderId),
    );
  }

  @Get('session/:sessionId')
  async getConversationWithMessages(
    @Param('sessionId') sessionId: string,
  ) {
    return this.conversationService.getConversationWithMessages(sessionId);
  }

  @Post(':conversationId/messages')
  async addMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: {
      question?: string;
      content: string;
      audioUrl?: string;
      videoUrl?: string;
    },
  ) {
    return this.conversationService.addMessage(Number(conversationId), body);
  }

  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
  ) {
    return this.conversationService.getMessages(Number(conversationId));
  }
}