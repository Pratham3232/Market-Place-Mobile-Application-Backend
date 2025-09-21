import { LocationImageType } from '@prisma/client';

export interface LocationImageUploadJob {
  locationProviderId: number;
  images: Array<{
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
    indoorOutdoorType: LocationImageType;
  }>;
  userId: string;
}