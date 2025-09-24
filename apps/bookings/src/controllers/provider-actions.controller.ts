import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { MessagingService, MessageData } from '../services/messaging.service';
import { SessionRecapService, SessionRecapData } from '../services/session-recap.service';

@Controller('provider-actions')
export class ProviderActionsController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly sessionRecapService: SessionRecapService
  ) {}

  // ========== MESSAGING ENDPOINTS ==========

  @Post('send-message')
  sendMessageToParent(@Body() messageData: MessageData) {
    return this.messagingService.sendMessageToParent(messageData);
  }

  @Get('conversations/:conversationId/messages')
  getConversationMessages(@Param('conversationId', ParseIntPipe) conversationId: number) {
    return this.messagingService.getConversationMessages(conversationId);
  }

  @Get('notifications/:userId')
  getUserNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.messagingService.getUserNotifications(userId, pageNum, limitNum);
  }

  // ========== SESSION RECAP ENDPOINTS ==========

  @Post('session-recap/:providerId')
  createSessionRecap(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() recapData: SessionRecapData
  ) {
    return this.sessionRecapService.createSessionRecap(recapData, providerId);
  }

  @Get('session-recap/:providerId')
  getProviderSessionRecaps(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.sessionRecapService.getProviderSessionRecaps(providerId, pageNum, limitNum);
  }

  @Get('session-recap/:providerId/booking/:bookingId')
  getSessionRecap(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number
  ) {
    return this.sessionRecapService.getSessionRecap(bookingId, providerId);
  }

  @Patch('session-recap/:providerId/booking/:bookingId')
  updateSessionRecap(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() recapData: Partial<SessionRecapData>
  ) {
    return this.sessionRecapService.updateSessionRecap(bookingId, recapData, providerId);
  }
}