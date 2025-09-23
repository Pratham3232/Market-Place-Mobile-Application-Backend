
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateSoloDto } from './dto/create-solo.dto';
import { UpdateSoloDto } from './dto/update-solo.dto';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class SoloService {
	constructor(
		private prisma: PrismaService,
		@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy
	) {}

	async findAll() {
		try {
			// @ts-ignore: soloProvider exists in the database but not in generated types
			return await this.prisma.provider.findMany({
				// where: {
				// 	soloProvider: true,
				// } as any,
			});
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: err.message || 'Failed to fetch solo providers'
			};
		}
	}

	async findOne(id: string) {
		try {
			// @ts-ignore: soloProvider exists in the database but not in generated types
			const provider = await this.prisma.provider.findFirst({
				where: {
					id: Number(id),
					soloProvider: true,
				} as any,
			});
			if (!provider) throw new NotFoundException('Solo provider not found');
			return provider;
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: err.message || 'Failed to fetch solo provider'
			};
		}
	}

	async create(dto: CreateSoloDto, userId?: number) {
		try {
			// Handle both new and legacy DTO formats
			let actualUserId = dto.userId || userId;
			let userData = dto.userData;

			// If userData is provided, create user first (new format)
			if (userData) {
				const user = await this.prisma.user.create({
					data: {
						phoneNumber: userData.phoneNumber || `temp_${Date.now()}`, // Temporary phone number
						name: userData.name,
						email: userData.email,
						gender: userData.gender,
						pronouns: userData.pronouns,
						dateOfBirth: userData.dateOfBirth,
						profileImage: userData.profileImage,
						isActive: true,
						roles: [UserRole.SOLO_PROVIDER],
					},
				});
				actualUserId = user.id;
			} else if (!actualUserId) {
				throw new BadRequestException('User ID or user data must be provided');
			}

			// Check if userId is unique for providers
			const exists = await this.prisma.provider.findUnique({
				where: { userId: actualUserId },
			});
			if (exists) throw new BadRequestException('Provider for this user already exists');

			// Create provider with provider-specific fields (address fields now in Provider)
			return await this.prisma.provider.create({
				data: {
					userId: actualUserId,
					address: dto.address,
					city: dto.city,
					state: dto.state,
					zipCode: dto.zipCode,
					latitude: dto.latitude,
					longitude: dto.longitude,
					soloProvider: dto.soloProvider ?? true,
					isVerified: dto.isVerified ?? false,
					rating: dto.rating ?? 0,
					totalReviews: dto.totalReviews ?? 0,
					isActive: dto.isActive ?? true,
					businessProviderId: dto.businessProviderId,
				},
				include: {
					user: true,
				},
			});
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: err.message || 'Failed to create solo provider'
			};
		}
	}

	// Microservice call to Auth for token validation
	private async getUserIdFromToken(token: string): Promise<number> {
		try {
			const userId = await this.authClient.send<number>('validateToken', token).toPromise();
			if (!userId) throw new Error('Invalid token');
			return userId;
		} catch (err) {
			throw new Error('Failed to validate token: ' + (err.message || err));
		}
	}

	async update(id: string, dto: UpdateSoloDto) {
		try {
			const provider = await this.prisma.provider.findUnique({
				where: { id: Number(id) },
				include: {
					user: true,
				},
			});
			if (!provider || !(provider as any).soloProvider) throw new NotFoundException('Solo provider not found');

			// Separate user data and provider data updates
			let userUpdateData: Prisma.UserUpdateInput = {};
			let providerUpdateData: Prisma.ProviderUpdateInput = {};

			// Handle userData object (new format)
			if (dto.userData) {
				const userData = dto.userData;
				if (userData.phoneNumber !== undefined) userUpdateData.phoneNumber = userData.phoneNumber;
				if (userData.name !== undefined) userUpdateData.name = userData.name;
				if (userData.email !== undefined) userUpdateData.email = userData.email;
				if (userData.gender !== undefined) userUpdateData.gender = userData.gender;
				if (userData.pronouns !== undefined) userUpdateData.pronouns = userData.pronouns;
				if (userData.dateOfBirth !== undefined) userUpdateData.dateOfBirth = userData.dateOfBirth;
				if (userData.profileImage !== undefined) userUpdateData.profileImage = userData.profileImage;
				if (userData.isActive !== undefined) userUpdateData.isActive = userData.isActive;
			}

			// Provider specific fields (address fields are now in Provider model)
			if (dto.address !== undefined) providerUpdateData.address = dto.address;
			if (dto.city !== undefined) providerUpdateData.city = dto.city;
			if (dto.state !== undefined) providerUpdateData.state = dto.state;
			if (dto.zipCode !== undefined) providerUpdateData.zipCode = dto.zipCode;
			if (dto.latitude !== undefined) providerUpdateData.latitude = dto.latitude;
			if (dto.longitude !== undefined) providerUpdateData.longitude = dto.longitude;
			if (dto.soloProvider !== undefined) providerUpdateData.soloProvider = dto.soloProvider;
			if (dto.isVerified !== undefined) providerUpdateData.isVerified = dto.isVerified;
			if (dto.rating !== undefined) providerUpdateData.rating = dto.rating;
			if (dto.totalReviews !== undefined) providerUpdateData.totalReviews = dto.totalReviews;
			if (dto.isActive !== undefined) {
				providerUpdateData.isActive = dto.isActive;
				userUpdateData.isActive = dto.isActive; // Keep both in sync
			}
			if (dto.businessProviderId !== undefined) {
				if (dto.businessProviderId) {
					providerUpdateData.businessProvider = {
						connect: { id: dto.businessProviderId }
					};
				} else {
					providerUpdateData.businessProvider = {
						disconnect: true
					};
				}
			}

			// Update user data if there are changes
			if (Object.keys(userUpdateData).length > 0) {
				providerUpdateData.user = {
					update: userUpdateData
				};
			}

			return await this.prisma.provider.update({
				where: { id: Number(id) },
				data: providerUpdateData,
				include: {
					user: true,
				},
			});
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: err.message || 'Failed to update solo provider'
			};
		}
	}

	async delete(id: string) {
		try {
			const provider = await this.prisma.provider.findUnique({
				where: { id: Number(id) },
			});
			if (!provider || !(provider as any).soloProvider) throw new NotFoundException('Solo provider not found');
			return await this.prisma.provider.delete({
				where: { id: Number(id) },
			});
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: err.message || 'Failed to delete solo provider'
			};
		}
	}
}
