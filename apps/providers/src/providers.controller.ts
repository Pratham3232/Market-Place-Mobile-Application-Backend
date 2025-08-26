import { Controller, Get } from '@nestjs/common';
import { ProvidersService } from './providers.service';

@Controller()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  getHello(): string {
    return this.providersService.getHello();
  }
}
