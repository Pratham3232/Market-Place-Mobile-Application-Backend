import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from './storage.service';
import { UserRole } from '@prisma/client';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

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
    example: { url: 'https://s3.amazonaws.com/bucket/image.png' }
  }})
  @ApiResponse({ status: 400, description: 'Missing file or user details' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('user_id') userId: string,
    @Body('user_type') userType: UserRole,
  ) {
    if (!file) throw new BadRequestException('file is required');
    if (!userId || !userType) throw new BadRequestException('user_id and user_type are required');

    const result = await this.storageService.uploadImage(file, userId, userType);
    return result; // { url: string }
  }
}
