
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateSoloDto } from './dto/create-solo.dto';
import { UpdateSoloDto } from './dto/update-solo.dto';

@Injectable()
export class SoloService {
	constructor(private prisma: PrismaService) {}

	async findAll() {
		// @ts-ignore: soloProvider exists in the database but not in generated types
		return this.prisma.provider.findMany({
			where: {
				soloProvider: true,
			} as any,
		});
	}

	async findOne(id: string) {
		// @ts-ignore: soloProvider exists in the database but not in generated types
		const provider = await this.prisma.provider.findFirst({
			where: {
				id: Number(id),
				soloProvider: true,
			} as any,
		});
		if (!provider) throw new NotFoundException('Solo provider not found');
		return provider;
	}

	async create(dto: CreateSoloDto) {
		// Check if userId is unique
		const exists = await this.prisma.provider.findUnique({
			where: { userId: dto.userId },
		});
		if (exists) throw new BadRequestException('Provider for this user already exists');
		// Only add soloProvider if allowed by Prisma type
		const { soloProvider, ...rest } = dto as any;
		return this.prisma.provider.create({
			data: {
				...rest,
				soloProvider: true,
			},
		});
	}

	async update(id: string, dto: UpdateSoloDto) {
		const provider = await this.prisma.provider.findUnique({
			where: { id: Number(id) },
		});
	if (!provider || !(provider as any).soloProvider) throw new NotFoundException('Solo provider not found');
		return this.prisma.provider.update({
			where: { id: Number(id) },
			data: dto,
		});
	}

	async delete(id: string) {
		const provider = await this.prisma.provider.findUnique({
			where: { id: Number(id) },
		});
	if (!provider || !(provider as any).soloProvider) throw new NotFoundException('Solo provider not found');
		return this.prisma.provider.delete({
			where: { id: Number(id) },
		});
	}
}
