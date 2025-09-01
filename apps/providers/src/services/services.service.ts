import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '@app/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prismaService: PrismaService
  ){}
  async findAll() {
    try{
      const result = await this.prismaService.service.findMany();
      return {
        success: true,
        data: result
      };
    }catch(err){
      return {
        success: false,
        message: err.message
      }
    }
  }

  async create(services: CreateServiceDto[]) {
    try {
      // Check all providerIds are the same
      const providerIds = services.map(s => s.providerId);
      const uniqueProviderIds = Array.from(new Set(providerIds));
      if (uniqueProviderIds.length !== 1) {
        return {
          success: false,
          message: 'All services must have the same providerId.'
        };
      }
      // Check provider exists
      const providerExists = await this.prismaService.provider.findUnique({
        where: { id: uniqueProviderIds[0] }
      });
      if (!providerExists) {
        return {
          success: false,
          message: 'Provider does not exist.'
        };
      }
      const createdServices = await this.prismaService.service.createMany({
        data: services,
        skipDuplicates: true
      });
      return {
        success: true,
        data: {
          services: createdServices
        }
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async createAvailability(availabilities: CreateAvailabilityDto[]) {
    try {
      // Check all providerIds are the same
      const providerIds = availabilities.map(a => a.providerId);
      const uniqueProviderIds = Array.from(new Set(providerIds));
      if (uniqueProviderIds.length !== 1) {
        return {
          success: false,
          message: 'All availabilities must have the same providerId.'
        };
      }
      // Check provider exists
      const providerExists = await this.prismaService.provider.findUnique({
        where: { id: uniqueProviderIds[0] }
      });
      if (!providerExists) {
        return {
          success: false,
          message: 'Provider does not exist.'
        };
      }
      const createdAvailabilities = await this.prismaService.availability.createMany({
        data: availabilities,
        skipDuplicates: true
      });
      return {
        success: true,
        data: {
          availabilities: createdAvailabilities
        }
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} service`;
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}
