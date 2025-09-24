import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { PrismaService } from '@app/common';
import { Child } from '@prisma/client';

@Injectable()
export class ChildService {
  constructor(private prisma: PrismaService) {}

  async create(createChildDto: CreateChildDto): Promise<Child> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: createChildDto.userId }
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const child = await this.prisma.child.create({
        data: {
          ...createChildDto,
          dateOfBirth: new Date(createChildDto.dateOfBirth)
        },
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

      return child;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create child');
    }
  }

  async findAll(): Promise<Child[]> {
    return this.prisma.child.findMany({
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

  async findOne(id: number): Promise<Child> {
    const child = await this.prisma.child.findUnique({
      where: { id },
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

    if (!child) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }

    return child;
  }

  async findByUserId(userId: number): Promise<Child[]> {
    return this.prisma.child.findMany({
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
      },
      orderBy: { dateOfBirth: 'desc' }
    });
  }

  async findByAge(minAge?: number, maxAge?: number): Promise<Child[]> {
    const currentDate = new Date();
    const where: any = {};

    if (minAge !== undefined) {
      const maxBirthDate = new Date(currentDate.getFullYear() - minAge, currentDate.getMonth(), currentDate.getDate());
      where.dateOfBirth = { lte: maxBirthDate };
    }

    if (maxAge !== undefined) {
      const minBirthDate = new Date(currentDate.getFullYear() - maxAge - 1, currentDate.getMonth(), currentDate.getDate());
      if (where.dateOfBirth) {
        where.dateOfBirth.gte = minBirthDate;
      } else {
        where.dateOfBirth = { gte: minBirthDate };
      }
    }

    return this.prisma.child.findMany({
      where,
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
      orderBy: { dateOfBirth: 'desc' }
    });
  }

  async update(id: number, updateChildDto: UpdateChildDto): Promise<Child> {
    // Check if child exists
    const existingChild = await this.prisma.child.findUnique({
      where: { id }
    });

    if (!existingChild) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }

    try {
      const updateData: any = { ...updateChildDto };
      
      // Convert dateOfBirth to Date if provided
      if (updateChildDto.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateChildDto.dateOfBirth);
      }

      const child = await this.prisma.child.update({
        where: { id },
        data: updateData,
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

      return child;
    } catch (error) {
      throw new BadRequestException('Failed to update child');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const child = await this.prisma.child.findUnique({
      where: { id }
    });

    if (!child) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }

    try {
      await this.prisma.child.delete({
        where: { id }
      });

      return { message: `Child with ID ${id} has been deleted` };
    } catch (error) {
      throw new BadRequestException('Failed to delete child');
    }
  }

  // Helper method to calculate age
  async getChildWithAge(childId: number): Promise<Child & { age: number }> {
    const child = await this.findOne(childId);
    const age = this.calculateAge(child.dateOfBirth);
    
    return {
      ...child,
      age
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
