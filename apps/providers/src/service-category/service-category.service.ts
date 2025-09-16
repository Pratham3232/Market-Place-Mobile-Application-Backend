import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@Injectable()
export class ServiceCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto) {
    try {
      const serviceCategory = await this.prisma.serviceCategory.create({
        data: {
          categoryName: createServiceCategoryDto.categoryName,
          createdBy: createServiceCategoryDto.createdBy,
          activities: {
            create: createServiceCategoryDto.activities.map(name => ({
              name
            }))
          }
        },
        include: {
          activities: true
        }
      });

      return serviceCategory;
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.code === 'P2002' 
          ? 'Service category with this name already exists'
          : err.message || 'Failed to create service category'
      };
    }
  }

  async findAll() {
    try {
      return await this.prisma.serviceCategory.findMany({
        include: {
          activities: true
        }
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch service categories'
      };
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.serviceCategory.findUnique({
        where: { id },
        include: {
          activities: true
        }
      });

      if (!category) {
        throw new NotFoundException('Service category not found');
      }

      return category;
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch service category'
      };
    }
  }

  async update(id: number, updateServiceCategoryDto: UpdateServiceCategoryDto) {
    try {
      // First check if the category exists
      const existingCategory = await this.prisma.serviceCategory.findUnique({
        where: { id },
        include: {
          activities: true
        }
      });

      if (!existingCategory) {
        throw new NotFoundException('Service category not found');
      }

      if (updateServiceCategoryDto.activities) {
        // Check if the activities already exist
        const existingActivityNames = existingCategory.activities.map(a => a.name);
        const duplicateActivities = updateServiceCategoryDto.activities.filter(
          activity => existingActivityNames.includes(activity)
        );

        if (duplicateActivities.length > 0) {
          return {
            success: false,
            message: `Activities already exist: ${duplicateActivities.join(', ')}`
          };
        }

        // Add new activities
        await this.prisma.activity.createMany({
          data: updateServiceCategoryDto.activities.map(name => ({
            name,
            serviceCategoryId: id
          }))
        });
      }

      // Get the updated category with activities
      const updatedCategory = await this.prisma.serviceCategory.findUnique({
        where: { id },
        include: {
          activities: true
        }
      });

      return updatedCategory;
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to update service category'
      };
    }
  }

  async remove(id: number) {
    try {
      // The activities will be automatically deleted due to onDelete: Cascade
      await this.prisma.serviceCategory.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Service category deleted successfully'
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to delete service category'
      };
    }
  }
}
