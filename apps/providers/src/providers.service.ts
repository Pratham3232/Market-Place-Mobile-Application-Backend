import { ConflictException, Injectable, NotFoundException, Provider } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { PrismaService } from '@app/common';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) { }
}
