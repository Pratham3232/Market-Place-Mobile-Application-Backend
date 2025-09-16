import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy
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
            gender: userData.gender as any,
            pronouns: userData.pronouns as any,
            profileImage: userData.profileImage,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zipCode: userData.zipCode,
            isActive: true,
            roles: [UserRole.LOCATION_PROVIDER],
          },
        });
        actualUserId = user.id;
      } else if (!actualUserId) {
        // Legacy format - create user from individual fields
        const user = await this.prisma.user.create({
          data: {
            phoneNumber: dto.phoneNumber || `temp_${Date.now()}`, // Temporary phone number
            name: dto.name,
            email: dto.email,
            gender: dto.gender as any,
            pronouns: dto.pronouns as any,
            profileImage: dto.profileImage,
            address: dto.address,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
            isActive: true,
            roles: [UserRole.LOCATION_PROVIDER],
          },
        });
        actualUserId = user.id;
      }

      // Check if userId is unique for location providers
      const exists = await this.prisma.locationProvider.findUnique({
        where: { userId: actualUserId },
      });
      if (exists) throw new BadRequestException('Location provider for this user already exists');

      // Create location provider with location-specific fields
      return await this.prisma.locationProvider.create({
        data: {
          userId: actualUserId,
          phone: dto.phone,
          contactPerson: dto.contactPerson,
          website: dto.website,
          fullAddress: dto.fullAddress,
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

      // New format - userData object
      if (dto.userData) {
        const userData = dto.userData;
        if (userData.phoneNumber !== undefined) userUpdateData.phoneNumber = userData.phoneNumber;
        if (userData.name !== undefined) userUpdateData.name = userData.name;
        if (userData.email !== undefined) userUpdateData.email = userData.email;
        if (userData.gender !== undefined) userUpdateData.gender = userData.gender as any;
        if (userData.pronouns !== undefined) userUpdateData.pronouns = userData.pronouns as any;
        if (userData.profileImage !== undefined) userUpdateData.profileImage = userData.profileImage;
        if (userData.address !== undefined) userUpdateData.address = userData.address;
        if (userData.city !== undefined) userUpdateData.city = userData.city;
        if (userData.state !== undefined) userUpdateData.state = userData.state;
        if (userData.zipCode !== undefined) userUpdateData.zipCode = userData.zipCode;
      }

      // Legacy format support - individual fields (for backward compatibility)
      if (dto.name !== undefined) userUpdateData.name = dto.name;
      if (dto.email !== undefined) userUpdateData.email = dto.email;
      if (dto.phoneNumber !== undefined) userUpdateData.phoneNumber = dto.phoneNumber;
      if (dto.gender !== undefined) userUpdateData.gender = dto.gender as any;
      if (dto.pronouns !== undefined) userUpdateData.pronouns = dto.pronouns as any;
      if (dto.profileImage !== undefined) userUpdateData.profileImage = dto.profileImage;
      if (dto.address !== undefined) userUpdateData.address = dto.address;
      if (dto.city !== undefined) userUpdateData.city = dto.city;
      if (dto.state !== undefined) userUpdateData.state = dto.state;
      if (dto.zipCode !== undefined) userUpdateData.zipCode = dto.zipCode;

      // Location provider specific fields
      if (dto.phone !== undefined) locationUpdateData.phone = dto.phone;
      if (dto.contactPerson !== undefined) locationUpdateData.contactPerson = dto.contactPerson;
      if (dto.website !== undefined) locationUpdateData.website = dto.website;
      if (dto.fullAddress !== undefined) locationUpdateData.fullAddress = dto.fullAddress;

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
}
