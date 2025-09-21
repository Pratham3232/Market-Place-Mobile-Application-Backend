import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { UserRole } from '@prisma/client';
import { MessagePattern } from '@nestjs/microservices';
import { PrismaService } from '../../../libs/common/src/prisma/prisma.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private blobServiceClient: BlobServiceClient;
  private readonly containerName = 'profile-images';

  constructor(private prisma: PrismaService) {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING env var is required');
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(conn);
  }

  /**
   * Uploads an in-memory file (Multer buffer) to Azure and returns the blob URL.
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    // userType: UserRole,
  ): Promise<{ status: boolean; url?: string; message?: string; error?: any }> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

      // Ensure container exists (no-op if it already does)
      await containerClient.createIfNotExists({ access: 'container' }); // change to 'private' in prod

      // Make a safe blob name (avoid weird chars)
      // const safeUserType = encodeURIComponent(userType);
      const safeUserId = encodeURIComponent(userId);
      // const timestamp = Date.now();
      const blobName = `user/${safeUserId}/${file.originalname}`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload the buffer
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype || 'application/octet-stream' },
      });

      return { 
        status: true,
        url: blockBlobClient.url 
      };
    } catch (err) {
      // bubble a clear server error to client
      // throw new InternalServerErrorException('Failed to upload image');
      return {
        status: false,
        error: err.message || 'Failed to upload image'
      }
    }
  }

  @MessagePattern('upload_file')
  async handleFileUpload(data: { file: Express.Multer.File; user_id: string }) {
    this.logger.log(`Handling file upload for user: ${data.user_id}`);
    return await this.uploadImage(data.file, data.user_id);
  }

  async getUserProfileImage(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        data: {
          userId: user.id,
          name: user.name,
          profileImage: user.profileImage,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get user profile image for user ${userId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to retrieve user profile image',
      };
    }
  }
}
