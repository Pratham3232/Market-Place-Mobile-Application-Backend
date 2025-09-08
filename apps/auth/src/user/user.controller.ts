import { Controller, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole, AccessBasedRole } from '@prisma/client';
import { AuthGuard, RolesGuard, Roles } from '@app/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get(':id')
    @UseGuards(AuthGuard)
    @Roles(AccessBasedRole.USER)
    async getUser(@Param('id') id: number): Promise<User | null> {
        return this.userService.getUser(+id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get(':id/:role')
    @Roles(AccessBasedRole.SOLO_PROVIDER, AccessBasedRole.BUSINESS_PROVIDER, AccessBasedRole.LOCATION_PROVIDER, AccessBasedRole.MEMBER) // Only admins can access this endpoint
    async getUserByRole(
        @Param('id') id: string, 
        @Param('role') role: UserRole
    ) {
        try {
            const result = await this.userService.getUserByIdAndRole(id, role);
            
            if (!result.status) {
                return {
                    success: false,
                    message: result.error || 'Failed to fetch user',
                    statusCode: 400
                };
            }

            return {
                success: true,
                data: result.data,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Internal server error',
                statusCode: 500
            };
        }
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(AccessBasedRole.USER)
    async updateUser(
        @Param('id') id: number,
        @Body() userData: { name?: string; email?: string; password?: string }
    ): Promise<User> {
        return this.userService.updateUser(+id, userData);
    }

    @Delete(':id')
    // @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(AccessBasedRole.USER)
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
    @UseGuards(AuthGuard)
    async getAllUsers(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @MessagePattern("get-user")
    async getUserById(id: number) {
        console.log("Received message: get-user", id);
        return this.userService.getUser(+id);
    }
}