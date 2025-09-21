import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, QUEUE_PATTERNS, STORAGE_SERVICE } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UploadLocationImagesDto } from './dto/upload-location-images.dto';
import { LocationImageUploadJob } from './dto/location-image-upload-job.dto';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(STORAGE_SERVICE) private readonly storageClient: ClientProxy
  ) {}

  async findAll() {
    try {
      return await this.prisma.locationProvider.findMany();
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch location providers'
      };
    }
  }

  async findOne(id: string) {
    try {
      const location = await this.prisma.locationProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!location) throw new NotFoundException('Location provider not found');
      return location;
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch location provider'
      };
    }
  }

  async create(dto: CreateLocationDto, userId?: number) {
    try {
      // Handle both new and legacy DTO formats
      let actualUserId = dto.userId || userId;
      let userData = dto.userData;

      // If userData is provided, create user first (new format)
      if (userData) {
        const user = await this.prisma.user.create({
          data: {
            phoneNumber: userData.phoneNumber || `temp_${Date.now()}`, // Temporary phone number
            name: userData.name,
            email: userData.email,
            gender: userData.gender,
            pronouns: userData.pronouns,
            dateOfBirth: userData.dateOfBirth,
            profileImage: userData.profileImage,
            isActive: true,
            roles: [UserRole.LOCATION_PROVIDER],
          },
        });
        actualUserId = user.id;
      } else if (!actualUserId) {
        throw new BadRequestException('User ID or user data must be provided');
      }

      // Check if userId is unique for location providers
      const exists = await this.prisma.locationProvider.findUnique({
        where: { userId: actualUserId },
      });
      if (exists) throw new BadRequestException('Location provider for this user already exists');

      // Create location provider with location-specific fields (address fields now in LocationProvider)
      return await this.prisma.locationProvider.create({
        data: {
          userId: actualUserId,
          phone: dto.phone,
          contactPerson: dto.contactPerson,
          website: dto.website,
          fullAddress: dto.fullAddress,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
        include: {
          User: true,
        },
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to create location provider'
      };
    }
  }

  // Microservice call to Auth for token validation
  private async getUserIdFromToken(token: string): Promise<number> {
    try {
      const userId = await this.authClient.send<number>('validateToken', token).toPromise();
      if (!userId) throw new Error('Invalid token');
      return userId;
    } catch (err) {
      throw new Error('Failed to validate token: ' + (err.message || err));
    }
  }

  async update(id: string, dto: UpdateLocationDto) {
    try {
      const location = await this.prisma.locationProvider.findUnique({
        where: { id: Number(id) },
        include: {
          User: true,
        },
      });
      if (!location) throw new NotFoundException('Location provider not found');

      // Handle both new and legacy DTO formats
      let userUpdateData: Prisma.UserUpdateInput = {};
      let locationUpdateData: Prisma.LocationProviderUpdateInput = {};

      // Handle userData object (new format)
      if (dto.userData) {
        const userData = dto.userData;
        if (userData.phoneNumber !== undefined) userUpdateData.phoneNumber = userData.phoneNumber;
        if (userData.name !== undefined) userUpdateData.name = userData.name;
        if (userData.email !== undefined) userUpdateData.email = userData.email;
        if (userData.gender !== undefined) userUpdateData.gender = userData.gender;
        if (userData.pronouns !== undefined) userUpdateData.pronouns = userData.pronouns;
        if (userData.dateOfBirth !== undefined) userUpdateData.dateOfBirth = userData.dateOfBirth;
        if (userData.profileImage !== undefined) userUpdateData.profileImage = userData.profileImage;
        if (userData.isActive !== undefined) userUpdateData.isActive = userData.isActive;
      }

      // Location provider specific fields (address fields now in LocationProvider)
      if (dto.phone !== undefined) locationUpdateData.phone = dto.phone;
      if (dto.contactPerson !== undefined) locationUpdateData.contactPerson = dto.contactPerson;
      if (dto.website !== undefined) locationUpdateData.website = dto.website;
      if (dto.fullAddress !== undefined) locationUpdateData.fullAddress = dto.fullAddress;
      if (dto.address !== undefined) locationUpdateData.address = dto.address;
      if (dto.city !== undefined) locationUpdateData.city = dto.city;
      if (dto.state !== undefined) locationUpdateData.state = dto.state;
      if (dto.zipCode !== undefined) locationUpdateData.zipCode = dto.zipCode;
      if (dto.latitude !== undefined) locationUpdateData.latitude = dto.latitude;
      if (dto.longitude !== undefined) locationUpdateData.longitude = dto.longitude;

      // Update user data if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        locationUpdateData.User = {
          update: userUpdateData
        };
      }

      return await this.prisma.locationProvider.update({
        where: { id: Number(id) },
        data: locationUpdateData,
        include: {
          User: true,
        },
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to update location provider'
      };
    }
  }

  async remove(id: string) {
    try {
      const location = await this.prisma.locationProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!location) throw new NotFoundException('Location provider not found');
      return await this.prisma.locationProvider.delete({
        where: { id: Number(id) },
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to delete location provider'
      };
    }
  }

  async uploadImages(locationProviderId: number, uploadDto: UploadLocationImagesDto, files: Express.Multer.File[], userId: string) {
    try {
      // Verify location provider exists
      const locationProvider = await this.prisma.locationProvider.findUnique({
        where: { id: locationProviderId },
      });
      if (!locationProvider) {
        throw new NotFoundException('Location provider not found');
      }

      // Prepare job data for queue
      const jobData: LocationImageUploadJob = {
        locationProviderId,
        userId,
        images: files.map((file, index) => ({
          fileBuffer: file.buffer,
          fileName: file.originalname,
          mimeType: file.mimetype,
          indoorOutdoorType: uploadDto.imageTypes[index].indoorOutdoorType,
        })),
      };

      // Send job to queue for background processing
      this.storageClient.emit(QUEUE_PATTERNS.UPLOAD_LOCATION_IMAGES, jobData);

      return {
        success: true,
        message: `Queued ${files.length} images for upload and processing`,
        queuedCount: files.length,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to queue image uploads'
      };
    }
  }

  async getImages(locationProviderId: number) {
    try {
      // Verify location provider exists
      const locationProvider = await this.prisma.locationProvider.findUnique({
        where: { id: locationProviderId },
      });
      if (!locationProvider) {
        throw new NotFoundException('Location provider not found');
      }

      const images = await this.prisma.locationImage.findMany({
        where: { locationProviderId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: images,
        count: images.length,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch images'
      };
    }
  }
}
