import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { Provider } from '@prisma/client';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) { }

  async createProvider(createProviderDto: CreateProviderDto, userId: number): Promise<Provider> {
    return this.prisma.provider.create({
      data: { ...createProviderDto, userId: userId },
    });
  }

  async addServicesToProvider(providerId: number, services: string[]): Promise<void> {
  }
}