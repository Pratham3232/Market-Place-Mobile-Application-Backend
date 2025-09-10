import { Controller, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, ParseIntPipe, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from '@prisma/client';
import { AuthGuard } from '../guards/auth.guard';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('/xpiScore/:id')
    async getXpiScore(@Param('id') id: string) {
        return this.userService.getXpiScore(id);
    }
    
    @Get(':id')
    // @UseGuards(AuthGuard)
    async getUser(@Param('id') id: number): Promise<User | null> {
        return this.userService.getUser(+id);
    }

    @Get(':id/:role')
    async getUserByRole(@Param('id') id: string, @Param('role') role: UserRole){
        return this.userService.getUserByIdAndRole(id, role);
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: number,
        @Body() userData: { name?: string; email?: string; password?: string }
    ): Promise<User> {
        return this.userService.updateUser(+id, userData);
    }

    @Patch(':id')
    async patchUser(
        @Param('id') id: string,
        @Body() userData: { xpiId?: number }
    ): Promise<User> {
        return this.userService.patchUser(id, userData);
    }

    @Delete(':id')
    // @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id') id: string): Promise<void> {
        await this.userService.deleteUser(id);
    }

    @Put(':id/role')
    async updateUserType(
        @Param('id', ParseIntPipe) id: number,
        @Body('type') type: UserRole
    ): Promise<User> {
        return this.userService.updateUserType(id, type);
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