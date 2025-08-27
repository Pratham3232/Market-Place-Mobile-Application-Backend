import { Body, Controller, Post } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';

@Controller("/provider")
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) { }

  @Post()
  private async createProvider(@Body() createProviderDto: CreateProviderDto) {
    this.providersService.createProvider(createProviderDto, 1);
  }
}
