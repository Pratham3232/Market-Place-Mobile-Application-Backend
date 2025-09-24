import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { PrismaService } from '@app/common';
import { Parent } from '@prisma/client';

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: createParentDto.userId }
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if email is already taken
      const existingParentWithEmail = await this.prisma.parent.findUnique({
        where: { email: createParentDto.email }
      });

      if (existingParentWithEmail) {
        throw new ConflictException('Email is already registered for another parent');
      }

      const parent = await this.prisma.parent.create({
        data: createParentDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              isActive: true
            }
          }
        }
      });

      return parent;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create parent');
    }
  }

  async findAll(): Promise<Parent[]> {
    return this.prisma.parent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isActive: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isActive: true,
            Child: true
          }
        }
      }
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async findByUserId(userId: number): Promise<Parent[]> {
    return this.prisma.parent.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isActive: true
          }
        }
      }
    });
  }

  async findByEmail(email: string): Promise<Parent | null> {
    return this.prisma.parent.findUnique({
      where: { email },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isActive: true
          }
        }
      }
    });
  }

  async update(id: number, updateParentDto: UpdateParentDto): Promise<Parent> {
    // Check if parent exists
    const existingParent = await this.prisma.parent.findUnique({
      where: { id }
    });

    if (!existingParent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    // Check if email is being updated and if it's already taken
    if (updateParentDto.email && updateParentDto.email !== existingParent.email) {
      const existingParentWithEmail = await this.prisma.parent.findUnique({
        where: { email: updateParentDto.email }
      });

      if (existingParentWithEmail) {
        throw new ConflictException('Email is already registered for another parent');
      }
    }

    try {
      const parent = await this.prisma.parent.update({
        where: { id },
        data: updateParentDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              isActive: true
            }
          }
        }
      });

      return parent;
    } catch (error) {
      throw new BadRequestException('Failed to update parent');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const parent = await this.prisma.parent.findUnique({
      where: { id }
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    try {
      await this.prisma.parent.delete({
        where: { id }
      });

      return { message: `Parent with ID ${id} has been deleted` };
    } catch (error) {
      throw new BadRequestException('Failed to delete parent');
    }
  }
}
