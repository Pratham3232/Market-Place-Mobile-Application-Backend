import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    private prisma: PrismaService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy
  ) {}

  async findAll() {
    try {
      return await this.prisma.businessProvider.findMany();
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch business providers'
      };
    }
  }

  async findOne(id: string) {
    try {
      const business = await this.prisma.businessProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!business) throw new NotFoundException('Business provider not found');
      return business;
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch business provider'
      };
    }
  }

  async create(dto: CreateBusinessDto, userId: number) {
    try {
      // Check if userId is unique
      const exists = await this.prisma.businessProvider.findUnique({
        where: { userId: userId },
      });
      if (exists) throw new BadRequestException('Business provider for this user already exists');
      return await this.prisma.businessProvider.create({
        data: { ...dto, userId },
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to create business provider'
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

  async update(id: string, dto: UpdateBusinessDto) {
    try {
      const business = await this.prisma.businessProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!business) throw new NotFoundException('Business provider not found');
      return await this.prisma.businessProvider.update({
        where: { id: Number(id) },
        data: dto as any,
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to update business provider'
      };
    }
  }

  async remove(id: string) {
    try {
      const business = await this.prisma.businessProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!business) throw new NotFoundException('Business provider not found');
      return await this.prisma.businessProvider.delete({
        where: { id: Number(id) },
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to delete business provider'
      };
    }
  }
}
