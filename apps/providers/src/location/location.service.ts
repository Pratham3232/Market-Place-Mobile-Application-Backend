import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.locationProvider.findMany();
  }

  async findOne(id: string) {
    const location = await this.prisma.locationProvider.findUnique({
      where: { id: Number(id) },
    });
    if (!location) throw new NotFoundException('Location provider not found');
    return location;
  }

  async create(dto: CreateLocationDto) {
    // Check if userId is unique
    const exists = await this.prisma.locationProvider.findUnique({
      where: { userId: dto.userId },
    });
    if (exists) throw new BadRequestException('Location provider for this user already exists');
    return this.prisma.locationProvider.create({
      data: dto as any,
    });
  }

  async update(id: string, dto: UpdateLocationDto) {
    const location = await this.prisma.locationProvider.findUnique({
      where: { id: Number(id) },
    });
    if (!location) throw new NotFoundException('Location provider not found');
    return this.prisma.locationProvider.update({
      where: { id: Number(id) },
      data: dto as any,
    });
  }

  async remove(id: string) {
    const location = await this.prisma.locationProvider.findUnique({
      where: { id: Number(id) },
    });
    if (!location) throw new NotFoundException('Location provider not found');
    return this.prisma.locationProvider.delete({
      where: { id: Number(id) },
    });
  }
}
