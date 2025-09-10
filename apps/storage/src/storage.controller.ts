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

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep in-memory buffer for small images
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
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
