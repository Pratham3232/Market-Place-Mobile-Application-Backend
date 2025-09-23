import { Injectable, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { QUEUE_PATTERNS } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { StorageService } from '../storage.service';
import { UserProfileImageUploadJob } from '../dto/user-profile-image-upload-job.dto';

@Injectable()
export class UserProfileImageProcessor {
  private readonly logger = new Logger(UserProfileImageProcessor.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {
    console.log('UserProfileImageProcessor instantiated');
  }

  @EventPattern(QUEUE_PATTERNS.UPLOAD_USER_PROFILE_IMAGE)
  async handleUserProfileImageUpload(job: UserProfileImageUploadJob) {
    this.logger.log(`Processing profile image upload for user ${job.userId}`);
    
    try {
      // Create a mock file object for the storage service
      const mockFile: Express.Multer.File = {
        buffer: job.file.fileBuffer,
        originalname: job.file.fileName,
        mimetype: job.file.mimeType,
        fieldname: 'file',
        encoding: '7bit',
        size: job.file.fileBuffer.length,
        destination: '',
        filename: '',
        path: '',
        stream: undefined as any,
      };
      
      console.log('Uploading image for user:', job.userId);

      // Upload to storage service
      const uploadResult = await this.storageService.uploadImage(mockFile, job.userId);

      if (!uploadResult.status || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Storage service did not return a valid URL');
      }

      // Update user's profile image in database
      const updatedUser = await this.prisma.user.update({
        where: { id: parseInt(job.userId) },
        data: {
          profileImage: uploadResult.url,
        },
        select: {
          id: true,
          profileImage: true,
          name: true,
        },
      });

      console.log('Updated user profile image:', updatedUser);

      this.logger.log(`Successfully uploaded and updated profile image for user: ${updatedUser.id}`);
      
      return {
        success: true,
        user: updatedUser,
        imageUrl: uploadResult.url,
      };
    } catch (error) {
      this.logger.error(`Profile image upload failed for user ${job.userId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}