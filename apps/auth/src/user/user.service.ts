import { PrismaService } from '@app/common';
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        return this.prisma.user.create({
            data: createUserDto,
        });
    }

    async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { phoneNumber },
        });
    }

    async getUserByPhoneNumberAndRole(phoneNumber: string, role: UserRole): Promise<User | null> {
        return this.prisma.user.findFirst({
            // where: { phoneNumber, role },
            where: { phoneNumber },
        });
    }

    async getUser(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }

    async updateUserType(id: number, type: UserRole): Promise<User> {
        const currentUser = await this.prisma.user.findUnique({
            where: { id },
            select: { roles: true }
        });
        if (!currentUser) {
            throw new Error('User not found');
        }
        // Add the new role to the existing roles array if it's not already there
        const updatedRoles = currentUser.roles.includes(type)
            ? currentUser.roles
            : [...currentUser.roles, type];
        return this.prisma.user.update({
            where: { id },
            data: { roles: updatedRoles },
        });
    }

    async deleteUser(id: number): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    async getAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }
}