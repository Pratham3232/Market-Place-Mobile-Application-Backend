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
    try{
      const createdServices = await this.prismaService.service.createMany({
        data: services
      })

      return {
        success: true,
        data: {
          services: createdServices
        }
      }
    }catch(err){
      return {
        success: false,
        message: err.message
      }
    }
  }

  async createAvailability(availabilities: CreateAvailabilityDto[]) {
    try {
      const createdAvailabilities = await this.prismaService.availability.createMany({
        data: availabilities
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
