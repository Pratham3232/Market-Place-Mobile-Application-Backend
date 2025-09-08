import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './user/user.service';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { AccessBasedRole } from '@prisma/client';
import * as twilio from 'twilio';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async signupLogin(phoneNumber: string) {
    try {
      
      if (await this.cacheManager.get(`auth-otp-block-${phoneNumber}`)) {
        throw new Error('Too many OTP requests. Please try again later.');
      }

      if (phoneNumber == '+11111111111'){
        await this.cacheManager.set(`auth-otp-${phoneNumber}`, '1234', 5 * 60 * 1000);
        return {
          success: true,
          message: 'OTP sent successfully',
        };
      }

      const user = await this.userService.getUserByPhoneNumber(phoneNumber);
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      const client = twilio(accountSid, authToken);

      const otp = await this.otpGenerator();
      await this.cacheManager.set(`auth-otp-${phoneNumber}`, otp, 300 * 1000);

      const countKey = `auth-otp-req-count-${phoneNumber}`;
      let currentCount = await this.cacheManager.get<number>(countKey);

      if (!currentCount) {
        // first request
        currentCount = 1;
        await this.cacheManager.set(countKey, currentCount, 300 * 1000);
      } else {
        currentCount++;
        await this.cacheManager.set(countKey, currentCount, 300 * 1000);
      }

      if (currentCount == 3) {
        await this.cacheManager.set(`auth-otp-block-${phoneNumber}`, true, 120 * 60 * 1000);
        // throw new Error('Too many OTP requests. Please try again later.');
      }

      if (!user) {
        client.messages.create({
          body: `Your XUMAN.ai verification code is ${otp}. It will expire in 5 minutes. Do not share this code with anyone.`,
          messagingServiceSid: messagingServiceSid,
          to: phoneNumber,
        }); 
      }else{
        client.messages.create({
          body: `Use ${otp} as your XUMAN.ai login code. This code will expire in 5 minutes. Never share it with anyone.`,
          messagingServiceSid: messagingServiceSid,
          to: phoneNumber,
        });
      }

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to send OTP',
      };
    }
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    try {
      const cachedOtp = await this.cacheManager.get<string>(`auth-otp-${phoneNumber}`)
      if (!cachedOtp) {
        throw new Error('OTP expired or not found');
      }
      if (cachedOtp !== otp) {
        throw new Error('Invalid OTP');
      }

      await this.cacheManager.del(`auth-otp-${phoneNumber}`);

      let user = await this.userService.getUserByPhoneNumber(phoneNumber);
      let userExists = !!user;
      if(!user){
        user = await this.userService.createUser({ phoneNumber, roles: [] });
      }

      const token = await this.generateToken(user.id);

      return {
        success: true,
        data: token,
        isNewUser: !userExists,
        roles: user.roles.length > 0 ? user.roles[0] : []
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.message 
      };
    }
  }

  async removeBlock(phoneNumber: string) {
    try {
      await this.cacheManager.del(`auth-otp-block-${phoneNumber}`);
      return {
        success: true,
        message: 'Block removed successfully',
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to remove block',
      };
    }
  }

  async sendSignUpOtp(phoneNumber: string) {
    try {
      const user = await this.userService.getUserByPhoneNumber(phoneNumber);
      if(user){
        throw new UnauthorizedException('User already exists');
      }

      const otp = await this.otpGenerator();
      await this.cacheManager.set(`register-otp-${phoneNumber}`, otp, 300 * 1000);

      // Send OTP to user's phone number
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        // body: `Your OTP is ${otp}`,
        body: `Your XUMAN.ai verification code is ${otp}. 
It will expire in 5 minutes. Do not share this code with anyone.`,
        messagingServiceSid: messagingServiceSid,
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
      return {
        success: false,
        message: err.message || 'Failed to send OTP',
      };
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
      if (!user){
        throw new Error('User registration failed');
      }
      return {
        success: true,
        message: 'User registered successfully',
        data: user
      }
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
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        // body: `Your OTP is ${otp}`,
        body: `Use ${otp} as your XUMAN.ai login code. 
This code will expire in 5 minutes. Never share it with anyone.`,
        messagingServiceSid: messagingServiceSid,
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
    const accessToken = uuidv4();
    const refreshToken = uuidv4();
    const accessTokenExpiresIn = 30 * 60; // 30 minutes
    const refreshTokenExpiresIn = 7 * 24 * 60 * 60; // 7 days

    // Store access token in cache
    await this.cacheManager.set(accessToken, userId, accessTokenExpiresIn * 1000);
    
    // Store refresh token in database
    await this.userService.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + refreshTokenExpiresIn * 1000)
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: accessTokenExpiresIn,
      refresh_token_expires_in: refreshTokenExpiresIn
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const tokenData = await this.userService.getRefreshToken(refreshToken);
      
      if (!tokenData || tokenData.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Generate new access token
      const accessToken = uuidv4();
      const accessTokenExpiresIn = 30 * 60; // 30 minutes

      await this.cacheManager.set(accessToken, tokenData.userId, accessTokenExpiresIn * 1000);

      return {
        access_token: accessToken,
        expires_in: accessTokenExpiresIn
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(token: string) {
    const userId = await this.cacheManager.get<string>(token);
    if (!userId) {
      console.log('Token not found in cache');
      throw new UnauthorizedException('Token not found in cache');
    }
    return userId;
  }

  async getUserRoles(userId: number) {
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user.roles;
  }

  async hasRole(userId: number, requiredRole: AccessBasedRole) {
    const user = await this.userService.getUser(userId);
    if (!user) {
      return false;
    }

    switch (requiredRole) {
      case AccessBasedRole.SOLO_PROVIDER:
        return user.roles.includes('SOLO_PROVIDER');
      case AccessBasedRole.BUSINESS_PROVIDER:
        return user.roles.includes('BUSINESS_PROVIDER');
      case AccessBasedRole.LOCATION_PROVIDER:
        return user.roles.includes('LOCATION_PROVIDER');
      case AccessBasedRole.SUPER_ADMIN:
        return user.roles.includes('SUPER_ADMIN');
      case AccessBasedRole.MEMBER:
        return user.roles.includes('MEMBER');
      case AccessBasedRole.USER:
        return true; // All authenticated users have USER access
      case AccessBasedRole.ADMIN:
        return user.roles.includes('SUPER_ADMIN'); // SUPER_ADMIN inherits ADMIN privileges
      case AccessBasedRole.SYSTEM:
        return user.roles.includes('SUPER_ADMIN'); // Only SUPER_ADMIN can access system features
      default:
        return false;
    }
  }

  async logout(token: string) {
    // Delete access token from cache
    await this.cacheManager.del(token);
  }

  async logoutAll(userId: number) {
    // Delete all refresh tokens for the user
    await this.userService.deleteAllRefreshTokens(userId);
  }
}