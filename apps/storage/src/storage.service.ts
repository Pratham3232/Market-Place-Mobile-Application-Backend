import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { UserRole } from '@prisma/client';

@Injectable()
export class StorageService {
  private blobServiceClient: BlobServiceClient;
  private readonly containerName = 'profile-images';

  constructor() {
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
    userType: UserRole,
  ): Promise<{ status: boolean; url?: string; message?: string; error?: any }> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

      // Ensure container exists (no-op if it already does)
      await containerClient.createIfNotExists({ access: 'container' }); // change to 'private' in prod

      // Make a safe blob name (avoid weird chars)
      const safeUserType = encodeURIComponent(userType);
      const safeUserId = encodeURIComponent(userId);
      const timestamp = Date.now();
      const blobName = `${safeUserType}/${safeUserId}/${timestamp}-${file.originalname}`;

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
}
