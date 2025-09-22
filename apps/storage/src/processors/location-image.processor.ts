import { Injectable, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { QUEUE_PATTERNS } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { StorageService } from '../storage.service';

interface LocationImageUploadJob {
  locationProviderId: number;
  userId: string;
  images: Array<{
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
    indoorOutdoorType: 'INDOOR' | 'OUTDOOR';
  }>;
}

@Injectable()
export class LocationImageProcessor {
  private readonly logger = new Logger(LocationImageProcessor.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  @EventPattern(QUEUE_PATTERNS.UPLOAD_LOCATION_IMAGES)
  async handleImageUpload(job: LocationImageUploadJob) {
    this.logger.log(`Processing image upload job for location ${job.locationProviderId}`);
    try {
      const uploadPromises = job.images.map(async (imageData) => {
        try {
          // Create a mock file object for the storage service
          const mockFile: Express.Multer.File = {
            buffer: imageData.fileBuffer,
            originalname: imageData.fileName,
            mimetype: imageData.mimeType,
            fieldname: 'file',
            encoding: '7bit',
            size: imageData.fileBuffer.length,
            destination: '',
            filename: '',
            path: '',
            stream: undefined as any,
          };

          // Upload to storage service
          const uploadResult = await this.storageService.uploadImage(mockFile, job.userId, job.locationProviderId);

          if (!uploadResult.status || !uploadResult.url) {
            throw new Error(uploadResult.error || 'Storage service did not return a valid URL');
          }

          // Create database entry
          const locationImage = await this.prisma.locationImage.create({
            data: {
              locationProviderId: job.locationProviderId,
              bucket: 'location-images', // Default bucket for location images
              url: uploadResult.url,
              indoorOutdoorType: imageData.indoorOutdoorType,
            },
          });

          this.logger.log(`Successfully uploaded and stored image: ${locationImage.id}`);
          return locationImage;
        } catch (error) {
          this.logger.error(`Failed to process image ${imageData.fileName}:`, error);
          throw error;
        }
      });

      // Process all images
      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Image upload job completed: ${successful} successful, ${failed} failed`);
      
      if (failed > 0) {
        const errors = results
          .filter(r => r.status === 'rejected')
          .map(r => (r as PromiseRejectedResult).reason.message);
        this.logger.error('Some images failed to upload:', errors);
      }

      return {
        success: true,
        processedCount: successful,
        failedCount: failed,
      };
    } catch (error) {
      this.logger.error(`Image upload job failed for location ${job.locationProviderId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}