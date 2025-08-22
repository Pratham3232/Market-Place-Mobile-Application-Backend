import { Controller, Post, Body, UnauthorizedException, Headers, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  private logger = new Logger('AuthController');

  @Post('register')
  async register(@Body() body: { email: string; password: string; name?: string }) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  async logout(@Headers('authorization') token: string) {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    await this.authService.logout(token.replace('Bearer ', ''));
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.userId;
  }
}