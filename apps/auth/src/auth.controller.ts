import { Controller, Post, Body, UnauthorizedException, Headers, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.authService.register(body);
  }

  @Post('sign-up-otp')
  async signUpOtp(@Body() body: { phoneNumber: string }) {
    console.log("Phone number received:", body.phoneNumber);
    return this.authService.sendSignUpOtp(body.phoneNumber);
  }

  @Post('sign-up-otp-verify')
  async signUpOtpVerification(@Body() body: { otp: string; phoneNumber: string }) {
    return this.authService.verifyRegisterOtp(body.phoneNumber, body.otp);
  }

  @Post('login-otp')
  async login(@Body() body: { phoneNumber: string }) {
    return this.authService.login(body.phoneNumber);
  }

  @Post('login-otp-verify')
  async loginOtpVerification(@Body() body: { otp: string; phoneNumber: string }) {
    return this.authService.verifyLoginOtp(body.phoneNumber, body.otp);
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