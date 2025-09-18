import { Injectable } from '@nestjs/common';
import { CreateLocationServiceDto, CreateServiceDto } from './dto/create-service.dto';
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

  async findLocationService(id: string) {
    try {
      let ID = Number(id);
      const result = await this.prismaService.locationService.findUnique({
        where: { id: ID }
      });
      return {
        success: true,
        data: result
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async create(services: CreateServiceDto[]) {
    try {
      // Check all providerIds are the same
      if(services[0].providerId){
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
      }else if(services[0].businessProviderId){
        const businessProviderIds = services.map(s => s.businessProviderId);
        const uniqueBusinessProviderIds = Array.from(new Set(businessProviderIds));
        if (uniqueBusinessProviderIds.length !== 1) {
          return {
            success: false,
            message: 'All services must have the same businessProviderId.'
          };
        }
        // Check business provider exists
        const businessProviderExists = await this.prismaService.businessProvider.findUnique({
          where: { id: uniqueBusinessProviderIds[0] }
        });
        if (!businessProviderExists) {
          return {
            success: false,
            message: 'Business provider does not exist.'
          };
        }
      }else {
        return {
          success: false,
          message: 'All services must have a providerId or businessProviderId.'
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

  async createForLocation(locationService: CreateLocationServiceDto) {
    try {
      const createdLocationService = await this.prismaService.locationService.create({
        data: locationService
      });
      return {
        success: true,
        data: {
          locationService: createdLocationService
        }
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async createForLocations(locationServices: CreateLocationServiceDto[]) {
    try {
      const createdLocationServices = await this.prismaService.locationService.createMany({
        data: locationServices,
        skipDuplicates: true
      });
      return {
        success: true,
        data: {
          locationServices: createdLocationServices
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
      if (availabilities[0].providerId) {
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
      }else if (availabilities[0].locationProviderId) {
        const locationProviderIds = availabilities.map(a => a.locationProviderId);
        const uniqueLocationProviderIds = Array.from(new Set(locationProviderIds));
        if (uniqueLocationProviderIds.length !== 1) {
          return {
            success: false,
            message: 'All availabilities must have the same locationProviderId.'
          };
        }

        // Check location provider exists
        const locationProviderExists = await this.prismaService.locationProvider.findUnique({
          where: { id: uniqueLocationProviderIds[0] }
        });
        if (!locationProviderExists) {
          return {
            success: false,
            message: 'Location provider does not exist.'
          };
        }
      }else if (availabilities[0].businessProviderId) {
        const businessProviderIds = availabilities.map(a => a.businessProviderId);
        const uniqueBusinessProviderIds = Array.from(new Set(businessProviderIds));
        if (uniqueBusinessProviderIds.length !== 1) {
          return {
            success: false,
            message: 'All availabilities must have the same businessProviderId.'
          };
        }

        // Check business provider exists
        const businessProviderExists = await this.prismaService.businessProvider.findUnique({
          where: { id: uniqueBusinessProviderIds[0] }
        });
        if (!businessProviderExists) {
          return {
            success: false,
            message: 'Business provider does not exist.'
          };
        }
      }else {
        return {
          success: false,
          message: 'All availabilities must have a providerId, locationProviderId, or businessProviderId.'
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

  async findAllProviderService(id: string, serviceProvider: string) {
    try {
      let ID = Number(id);
      let result: any;
      switch (serviceProvider) {
        case 'soloProvider':
           result = this.prismaService.service.findMany({
            where: {
              providerId: ID
            }
          })
        case 'businessProvider':
           result = this.prismaService.service.findMany({
            where: {
              businessProviderId: ID
            }
          })
        case 'locationProvider':
           result = this.prismaService.locationService.findMany({
            where: {
              locationProviderId: ID
            }
          })
      }
      return {
        success: true,
        data: result
      }
    }catch(err){
      return {
        success: false,
        message: err.message
      };
    }
  }

  async findAllAvailability() {
    try {
      const availabilities = await this.prismaService.availability.findMany();
      return {
        success: true,
        data: availabilities
      };
    }catch(err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async findAvailability(id: string, serviceProvider: string) {
    
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}
