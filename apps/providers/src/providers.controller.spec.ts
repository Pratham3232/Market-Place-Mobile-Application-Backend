import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

describe('ProvidersController', () => {
  let providersController: ProvidersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [ProvidersService],
    }).compile();

    providersController = app.get<ProvidersController>(ProvidersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(providersController.getHello()).toBe('Hello World!');
    });
  });
});
