import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './user/user.service';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import * as twilio from 'twilio';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async sendSignUpOtp(phoneNumber: string) {
    try {
      const otp = await this.otpGenerator();
      await this.cacheManager.set(`register-otp-${phoneNumber}`, otp, 300 * 1000);

      // Send OTP to user's phone number
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      console.log(`OTP for ${phoneNumber}: ${otp}`); // For development purposes only
      // console.log(`Message body: ${message.body}`);

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (err) {
      console.error(err);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyRegisterOtp(phoneNumber: string, otp: string) {
    try {
      const cachedOtp = await this.cacheManager.get<string>(`register-otp-${phoneNumber}`)
      if (!cachedOtp) {
        throw new Error('OTP expired or not found');
      }
      if (cachedOtp !== otp) {
        throw new Error('Invalid OTP');
      }
      await this.cacheManager.del(`register-otp-${phoneNumber}`);
      return {
        success: true,
        message: 'OTP verified successfully',
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.message 
      };
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    try {
      const user = await this.userService.registerOrUpdateUserRole(registerUserDto);
      return this.generateToken(user.id);
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async login(phoneNumber: string) {
    try {
      const user = await this.userService.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const otp = await this.otpGenerator();
      await this.cacheManager.set(`login-otp-${phoneNumber}`, otp, 300 * 1000);

      // Send OTP to user's phone number
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        body: `Your login OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      console.log(`Login OTP for ${phoneNumber}: ${otp}`); // For development purposes only
      // console.log(`Message body: ${message.body}`);

      return {
        success: true,
        message: 'Login OTP sent successfully',
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  async verifyLoginOtp(phoneNumber: string, otp: string) {
    try {
      const cachedOtp = await this.cacheManager.get<string>(`login-otp-${phoneNumber}`)
      if (!cachedOtp) {
        throw new Error('OTP expired or not found');
      }
      if (cachedOtp !== otp) {
        throw new Error('Invalid OTP');
      }

      await this.cacheManager.del(`login-otp-${phoneNumber}`);
      const user = await this.userService.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateToken(user.id);
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  }

  private async otpGenerator(): Promise<string> {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private async generateToken(userId: number) {
    const token = uuidv4();
    const expiresIn = 3600;
    await this.cacheManager.set(token, userId, expiresIn * 1000);
    return {
      access_token: token,
      expires_in: expiresIn,
    };
  }

  async validateToken(token: string) {
    const userId = await this.cacheManager.get<string>(token);
    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }
    return userId;
  }

  async logout(token: string) {
    await this.cacheManager.del(token);
  }
}