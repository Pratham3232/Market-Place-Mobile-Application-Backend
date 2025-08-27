import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './user/user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.getUserByPhoneNumber(createUserDto.phoneNumber);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const user = await this.userService.createUser(createUserDto);
    return this.generateToken(user.id);
  }

  // async login(phoneNumber: string) {
  //   const user = await this.userService.getUserByPhoneNumber(phoneNumber);
  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  //   return this.generateToken(user.id);
  // }

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