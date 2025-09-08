import { Controller, Post, Body, UnauthorizedException, Headers, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@app/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @UseGuards(AuthGuard)
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

  @Post('signup-login')
  async signupLogin(@Body() body: { phoneNumber: string }) {
    return this.authService.signupLogin(body.phoneNumber);
  }

  @Post('signup-login-verify')
  async signupLoginVerification(@Body() body: { otp: string; phoneNumber: string }) {
    return this.authService.verifyOtp(body.phoneNumber, body.otp);
  }

  @Post('remove-block')
  async removeBlock(@Body() body: { phoneNumber: string }) {
    return this.authService.removeBlock(body.phoneNumber);
  }

  @Post('logout')
  async logout(@Headers('authorization') token: string) {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    await this.authService.logout(token.replace('Bearer ', ''));
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      const result = await this.authService.refreshAccessToken(body.refresh_token);
      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    try{
      const user = await this.authService.validateToken(data);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return user;
    }catch(err){
      console.error(err);
      throw new UnauthorizedException('Authentication failed');
    }
    // return data.userId;
  }

  @MessagePattern('validate_token')
  async validateTokenHandler(@Payload() data: { token: string }) {
    try {
      const userId = await this.authService.validateToken(data.token);
      if (!userId) {
        throw new UnauthorizedException('Invalid token');
      }
      const roles = await this.authService.getUserRoles(Number(userId));
      return { userId, roles };
    } catch (err) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  @MessagePattern('validate_roles')
  async validateRolesHandler(@Payload() data: { userId: number, requiredRoles: string[] }) {
    try {
      const userRoles = await this.authService.getUserRoles(Number(data.userId));
      // Compare roles as strings to avoid type mismatch
      const hasAccess = data.requiredRoles.some(role => userRoles.map(r => String(r)).includes(String(role)));
      return hasAccess;
    } catch (err) {
      return false;
    }
  }
}