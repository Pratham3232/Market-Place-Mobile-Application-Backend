import { PrismaService } from '@app/common';
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RegisterUserDto } from '../dto/create-user.dto';

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

    async getUserByIdAndRole(id: string, role: UserRole){
        try{
            let query: any = {
                where: {
                    id: Number(id),
                },
            };

            switch (role) {
                case UserRole.SOLO_PROVIDER:
                    query.where.roles = { has: UserRole.SOLO_PROVIDER };
                    query.include = { provider: true };
                    break;

                case UserRole.LOCATION_PROVIDER:
                    query.where.roles = { has: UserRole.LOCATION_PROVIDER };
                    query.include = { LocationProvider: true };
                    break;

                case UserRole.BUSINESS_PROVIDER:
                    query.where.roles = { has: UserRole.BUSINESS_PROVIDER };
                    query.include = { BusinessProvider: true };
                    break;
                default:
                    query.include = {};
            }

            const user = await this.prisma.user.findFirst(query);

            return {
                status: true,
                data: user
            }

        }catch(err){
            return {
                status: false,
                error: err.message
            }
        }
    }

    async patchUser(id: string, userData: { xpiId?: number }): Promise<User> {
        return this.prisma.user.update({
            where: { id: Number(id) },
            data: userData,
        });
    }

    async getXpiScore(id: string){
        try{
            const user = await this.prisma.user.findFirst({
                where: { id: Number(id) },
                select: { xpiId: true }
            })

            if(!user || !user.xpiId){
                throw new Error('user not found or xpiId not set');
            }

            // Fetch XPI score from external service
            const BaseUrl = process.env.XPI_BASE_URL;
            if(!BaseUrl){
                throw new Error('XPI_BASE_URL not set in environment variables');
            }
            const xpiResponse = await fetch(`${BaseUrl}/traits/parent/${user.xpiId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer YOUR_XPI_API_KEY` // Replace with actual API key
                }
            });

            if (!xpiResponse.ok) {
                throw new Error(`${xpiResponse.statusText}`);
            }

            console.log("XPI Response Status:", JSON.stringify(xpiResponse));

            const xpiData = await xpiResponse.json();

            return {
                status: true,
                data: xpiData
            }
        }catch(err){
            return {
                status: false,
                error: err.message || 'Error fetching XPI score'
            }
        }
    }

    async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { phoneNumber },
        });
    }

    // Accepts an array of roles for checking if user has any of the roles
    async getUserByPhoneNumberAndRole(phoneNumber: string, roles: UserRole[]): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { 
                phoneNumber,
                roles: {
                    hasSome: roles,
                }
            },
        });
    }

    // Register user with a single role, or add role to existing user
    async registerOrUpdateUserRole(registerUserDto: RegisterUserDto): Promise<User> {
        const { phoneNumber, roles, ...rest } = registerUserDto;
        const role = Array.isArray(roles) ? roles[0] : roles; // Only one role allowed for register
        let user = await this.prisma.user.findUnique({ where: { phoneNumber } });

        if (user) {
            // Add role if not present
            if (!user.roles.includes(role)) {
                const updatedRoles = [...user.roles, role];
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { roles: updatedRoles },
                });
            }
            return user;
        } else {
            // Create user with roles array containing the single role
            return this.prisma.user.create({
                data: {
                    phoneNumber,
                    roles: [role],
                    ...rest,
                },
            });
        }
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

    async deleteUser(id: string): Promise<User> {
        const userId = Number(id);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        return this.prisma.user.delete({
            where: { id: userId },
        });
    }

    async getAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async createRefreshToken(data: { token: string; userId: number; expiresAt: Date }) {
        return this.prisma.refreshToken.create({
            data
        });
    }

    async getRefreshToken(token: string) {
        return this.prisma.refreshToken.findUnique({
            where: { token }
        });
    }

    async deleteRefreshToken(token: string) {
        return this.prisma.refreshToken.delete({
            where: { token }
        });
    }

    async deleteAllRefreshTokens(userId: number) {
        return this.prisma.refreshToken.deleteMany({
            where: { userId }
        });
    }
}