import { Controller, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { AuthGuard } from '../guards/auth.guard';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get(':id')
    @UseGuards(AuthGuard)
    async getUser(@Param('id') id: number): Promise<User | null> {
        return this.userService.getUser(+id);
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: number,
        @Body() userData: { name?: string; email?: string; password?: string }
    ): Promise<User> {
        return this.userService.updateUser(+id, userData);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id') id: number): Promise<void> {
        await this.userService.deleteUser(id);
    }

    @Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @MessagePattern("get-user")
    async getUserById(id: number) {
        console.log("Received message: get-user", id);
        return this.userService.getUser(+id);
    }
}