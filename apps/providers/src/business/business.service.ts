import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.businessProvider.findMany();
  }

  async findOne(id: string) {
    const business = await this.prisma.businessProvider.findUnique({
      where: { id: Number(id) },
    });
    if (!business) throw new NotFoundException('Business provider not found');
    return business;
  }

  async create(dto: CreateBusinessDto) {
    // Check if userId is unique
    const exists = await this.prisma.businessProvider.findUnique({
      where: { userId: dto.userId },
    });
    if (exists) throw new BadRequestException('Business provider for this user already exists');
    return this.prisma.businessProvider.create({
      data: dto as any,
    });
  }

  async update(id: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.businessProvider.findUnique({
      where: { id: Number(id) },
    });
    if (!business) throw new NotFoundException('Business provider not found');
    return this.prisma.businessProvider.update({
      where: { id: Number(id) },
      data: dto as any,
    });
  }

  async remove(id: string) {
    const business = await this.prisma.businessProvider.findUnique({
      where: { id: Number(id) },
    });
    if (!business) throw new NotFoundException('Business provider not found');
    return this.prisma.businessProvider.delete({
      where: { id: Number(id) },
    });
  }
}
