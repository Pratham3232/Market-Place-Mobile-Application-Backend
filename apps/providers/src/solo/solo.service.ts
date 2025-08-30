
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateSoloDto } from './dto/create-solo.dto';
import { UpdateSoloDto } from './dto/update-solo.dto';

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
				where: {
					soloProvider: true,
				} as any,
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

	async create(dto: CreateSoloDto, userId: number) {
		try {
			// Check if userId is unique
			const exists = await this.prisma.provider.findUnique({
				where: { userId: userId },
			});
			if (exists) throw new BadRequestException('Provider for this user already exists');
			// Only add soloProvider if allowed by Prisma type
			const { soloProvider, ...rest } = dto as any;
			return await this.prisma.provider.create({
				data: {
					...rest,
					userId,
					soloProvider: true,
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
			});
			if (!provider || !(provider as any).soloProvider) throw new NotFoundException('Solo provider not found');
			return await this.prisma.provider.update({
				where: { id: Number(id) },
				data: dto,
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
