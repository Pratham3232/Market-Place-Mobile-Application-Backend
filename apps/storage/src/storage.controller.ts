import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  Body,
  UseInterceptors,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from './storage.service';
import { UserRole } from '@prisma/client';
import { QUEUE_PATTERNS } from '@app/common';
import { UserProfileImageUploadJob } from './dto/user-profile-image-upload-job.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    @Inject('USER_PROFILE_QUEUE') private readonly userProfileQueue: ClientProxy
  ) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep in-memory buffer for small images
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    }),
  )
  @ApiOperation({ summary: 'Upload file to storage' })
  @ApiConsumes('multipart/form-data')
   @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        user_id: { type: 'string', example: '12345' },
        user_type: {
          type: 'string',
          enum: Object.values(UserRole),
          example: 'ADMIN',
        },
      },
      required: ['file', 'user_id', 'user_type'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', schema: {
    example: { success: true, message: 'Profile image queued for upload and processing' }
  }})
  @ApiResponse({ status: 400, description: 'Missing file or user details' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('user_id') userId: string,
    // @Body('user_type') userType: UserRole,
  ) {
    if (!file) throw new BadRequestException('file is required');
    if (!userId) throw new BadRequestException('user_id is required');

    // Prepare job data for queue
    const jobData: UserProfileImageUploadJob = {
      userId,
      file: {
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
      },
    };

    // Send job to queue for background processing
    this.userProfileQueue.emit(QUEUE_PATTERNS.UPLOAD_USER_PROFILE_IMAGE, jobData);

    return {
      success: true,
      message: 'Profile image queued for upload and processing',
    };
  }

  @Get('/user/:userId/profile-image')
  @ApiOperation({ summary: 'Get user profile image URL' })
  @ApiResponse({ status: 200, description: 'User profile image retrieved successfully' })
  async getUserProfileImage(@Param('userId') userId: string) {
    return this.storageService.getUserProfileImage(userId);
  }
}
