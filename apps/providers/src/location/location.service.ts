import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { PrismaService } from '@app/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

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

  async create(dto: CreateLocationDto, userId: number) {
    try {
      // Check if userId is unique
      const exists = await this.prisma.locationProvider.findUnique({
        where: { userId: userId },
      });
      if (exists) throw new BadRequestException('Location provider for this user already exists');
      return await this.prisma.locationProvider.create({
        data: { ...dto, userId },
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
      });
      if (!location) throw new NotFoundException('Location provider not found');
      return await this.prisma.locationProvider.update({
        where: { id: Number(id) },
        data: dto as any,
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
