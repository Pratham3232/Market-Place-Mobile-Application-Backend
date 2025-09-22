import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SendEmployeeInvitationDto } from './dto/send-employee-invitation.dto';
import { UserRole, Prisma } from '@prisma/client';

// ...existing code...

@Injectable()
export class BusinessService {
  constructor(
    private prisma: PrismaService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy
  ) {}

  /**
   * Verify onboarding link for employee
   */
  async verifyOnboardingLink(token: string) {
    // Find link by token and check expiry and usage
    const link = await this.prisma.linkExpiryAndUsage.findUnique({ where: { token } });
    if (!link) {
      return { success: false, message: 'Invalid or expired link' };
    }
    if (link.expiresAt < new Date()) {
      return { success: false, message: 'Link has expired' };
    }
    if (link.limitConsumed <= 0) {
      return { success: false, message: 'Link usage limit reached' };
    }
    return { success: true, businessProviderId: link.businessProviderId };
  }

  /**
   * Onboard employee using onboarding link (token)
   */
  async onboardEmployeeViaLink(token: string, userData: any, serviceData: any, availabilityData: any) {
    // 1. Verify link
    const link = await this.prisma.linkExpiryAndUsage.findUnique({ where: { token } });
    if (!link || link.expiresAt < new Date() || link.limitConsumed <= 0) {
      return { success: false, message: 'Invalid or expired link' };
    }
    // 2. Add employee to business
    const addResult = await this.addEmployeeToBusiness(link.businessProviderId, [{ userData, serviceData, availabilityData }]);
    if (!addResult.success) {
      return { success: false, message: addResult.results[0]?.message || 'Failed to onboard employee' };
    }
    // 3. Decrement usage and push userId to employeeUsed
    const newUserId = addResult.results[0]?.user?.id;
    await this.prisma.linkExpiryAndUsage.update({
      where: { token },
      data: {
        limitConsumed: { decrement: 1 },
        employeeUsed: {
          push: newUserId
        }
      },
    });
    return { success: true, data: addResult.results[0] };
  }


  /**
   * Add multiple employees to a business: creates user, provider, service, and availability for each.
   * @param businessId - The businessProviderId to map employees to
   * @param employees - Array of employee objects with user, service, and availability data
   */
  async addEmployeeToBusiness(businessId: number, employees: Array<{
    userData: {
      phoneNumber: string;
      name?: string;
      email?: string;
      gender?: string;
      pronouns?: string;
      dateOfBirth?: Date;
      profileImage?: string;
    },
    serviceData: any, // Should match CreateServiceDto
    availabilityData: any // Should match CreateAvailabilityDto
  }>) {
    const results: Array<{
      success: boolean;
      user?: any;
      provider?: any;
      service?: any | undefined;
      availability?: any;
      message?: string;
    }> = [];
    for (const emp of employees) {
      try {
        // 0. Check if user with phoneNumber exists and has SOLO_PROVIDER role
        const existingUser = await this.prisma.user.findUnique({
          where: { phoneNumber: emp.userData.phoneNumber },
        });
        if (existingUser && existingUser.roles && existingUser.roles.includes(UserRole.SOLO_PROVIDER)) {
          results.push({
            success: false,
            message: `User with phone number ${emp.userData.phoneNumber} already exists as SOLO_PROVIDER and cannot be added as BUSINESS_EMPLOYEE`,
          });
          continue;
        }

        // 1. Create user with BUSINESS_EMPLOYEE role
        // Only include dateOfBirth/profileImage if present
        const userCreateData: any = {
          phoneNumber: emp.userData.phoneNumber,
          name: emp.userData.name,
          email: emp.userData.email,
          isActive: true,
          roles: [UserRole.BUSINESS_EMPLOYEE],
        };
        if (emp.userData.gender !== undefined && emp.userData.gender !== null) {
          userCreateData.gender = emp.userData.gender as any;
        }
        if (emp.userData.pronouns !== undefined && emp.userData.pronouns !== null) {
          userCreateData.pronouns = emp.userData.pronouns as any;
        }
        if (emp.userData.dateOfBirth !== undefined && emp.userData.dateOfBirth !== null) {
          userCreateData.dateOfBirth = emp.userData.dateOfBirth;
        }
        if (emp.userData.profileImage !== undefined && emp.userData.profileImage !== null) {
          userCreateData.profileImage = emp.userData.profileImage;
        }

        const user = await this.prisma.user.create({
          data: userCreateData,
        });

        // 2. Create provider entry mapped to businessProviderId
        const provider = await this.prisma.provider.create({
          data: {
            userId: user.id,
            businessProviderId: businessId,
            soloProvider: false,
            isActive: true,
          },
        });

        // 3. Optionally create service entry with providerId if serviceData is provided
        let service: any = undefined;
        if (emp.serviceData && Object.keys(emp.serviceData).length > 0) {
          service = await this.prisma.service.create({
            data: {
              ...emp.serviceData,
              providerId: provider.id,
              businessProviderId: businessId,
            },
          });
        }

        // 4. Create availability entry with providerId
        const availability = await this.prisma.availability.create({
          data: {
            ...emp.availabilityData,
            providerId: provider.id,
            businessProviderId: businessId,
          },
        });

        results.push({
          success: true,
          user,
          provider,
          service: service ?? undefined,
          availability,
        });
      } catch (err) {
        results.push({
          success: false,
          message: err.message,
        });
      }
    }
    return {
      success: results.every(r => r.success),
      results,
    };
  }




  async findAll() {
    try {
      return await this.prisma.businessProvider.findMany();
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch business providers'
      };
    }
  }

  async findOne(id: string) {
    try {
      const business = await this.prisma.businessProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!business) throw new NotFoundException('Business provider not found');
      return business;
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to fetch business provider'
      };
    }
  }

  async create(dto: CreateBusinessDto, userId?: number) {
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
            roles: [UserRole.BUSINESS_PROVIDER],
          },
        });
        actualUserId = user.id;
      } else if (!actualUserId) {
        throw new BadRequestException('User ID or user data must be provided');
      }

      // Check if userId is unique for business providers
      const exists = await this.prisma.businessProvider.findUnique({
        where: { userId: actualUserId },
      });
      if (exists) throw new BadRequestException('Business provider for this user already exists');

      // Create business provider with business-specific fields (address fields now in BusinessProvider)
      const businessProvider = await this.prisma.businessProvider.create({
        data: {
          userId: actualUserId,
          businessName: dto.businessName,
          businessType: dto.businessType,
          businessEmail: dto.businessEmail,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
          availabilityModification: dto.availabilityModification ?? false,
          serviceModification: dto.serviceModification ?? false,
          deliveryOptionChoices: dto.deliveryOptionChoices ?? false,
          bookingApprovalRequired: dto.bookingApprovalRequired ?? false,
          changeCategoryOption: dto.changeCategoryOption ?? false,
          priceModificationOption: dto.priceModificationOption ?? false,
          adminName: dto.adminName,
        },
        include: {
          User: true,
        },
      });

      // Create corresponding Provider entry with soloProvider = false and reference to BusinessProvider
      const provider = await this.prisma.provider.create({
        data: {
          userId: actualUserId,
          soloProvider: false,
          businessProviderId: businessProvider.id,
          isActive: true,
        },
        include: {
          user: true,
          businessProvider: true,
        },
      });

      return {
        success: true,
        businessProvider,
        provider,
        message: 'Business provider and corresponding provider entry created successfully'
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to create business provider'
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

  async update(id: string, dto: UpdateBusinessDto) {
    try {
      const business = await this.prisma.businessProvider.findUnique({
        where: { id: Number(id) },
        include: {
          User: true,
        },
      });
      if (!business) throw new NotFoundException('Business provider not found');

      // Handle both new and legacy DTO formats
      let userUpdateData: Prisma.UserUpdateInput = {};
      let businessUpdateData: Prisma.BusinessProviderUpdateInput = {};

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

      // Business provider specific fields (including address fields which are now in BusinessProvider)
      if (dto.businessName !== undefined) businessUpdateData.businessName = dto.businessName;
      if (dto.businessType !== undefined) businessUpdateData.businessType = dto.businessType;
      if (dto.businessEmail !== undefined) businessUpdateData.businessEmail = dto.businessEmail;
      if (dto.address !== undefined) businessUpdateData.address = dto.address;
      if (dto.city !== undefined) businessUpdateData.city = dto.city;
      if (dto.state !== undefined) businessUpdateData.state = dto.state;
      if (dto.zipCode !== undefined) businessUpdateData.zipCode = dto.zipCode;
      if (dto.latitude !== undefined) businessUpdateData.latitude = dto.latitude;
      if (dto.longitude !== undefined) businessUpdateData.longitude = dto.longitude;
      if (dto.availabilityModification !== undefined) businessUpdateData.availabilityModification = dto.availabilityModification;
      if (dto.serviceModification !== undefined) businessUpdateData.serviceModification = dto.serviceModification;
      if (dto.deliveryOptionChoices !== undefined) businessUpdateData.deliveryOptionChoices = dto.deliveryOptionChoices;
      if (dto.bookingApprovalRequired !== undefined) businessUpdateData.bookingApprovalRequired = dto.bookingApprovalRequired;
      if (dto.changeCategoryOption !== undefined) businessUpdateData.changeCategoryOption = dto.changeCategoryOption;
      if (dto.priceModificationOption !== undefined) businessUpdateData.priceModificationOption = dto.priceModificationOption;
      if (dto.adminName !== undefined) businessUpdateData.adminName = dto.adminName;

      // Update user data if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        businessUpdateData.User = {
          update: userUpdateData
        };
      }

      return await this.prisma.businessProvider.update({
        where: { id: Number(id) },
        data: businessUpdateData,
        include: {
          User: true,
        },
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to update business provider'
      };
    }
  }

  async remove(id: string) {
    try {
      const business = await this.prisma.businessProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!business) throw new NotFoundException('Business provider not found');
      return await this.prisma.businessProvider.delete({
        where: { id: Number(id) },
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to delete business provider'
      };
    }
  }

  async sendEmployeeInvitation(businessProviderId: number, dto: SendEmployeeInvitationDto) {
    try {
      // Check if business provider exists
      const businessProvider = await this.prisma.businessProvider.findUnique({
        where: { id: businessProviderId },
      });

      if (!businessProvider) {
        throw new NotFoundException('Business provider not found');
      }

      // Check if user with phone number already exists
      let user = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phoneNumber },
      });

      // If user doesn't exist, create a new one
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            phoneNumber: dto.phoneNumber,
            roles: [UserRole.BUSINESS_EMPLOYEE],
            isActive: true,
          },
        });
      } else {
        // If user exists, check if they're already a provider for this business
        const existingProvider = await this.prisma.provider.findFirst({
          where: { 
            userId: user.id,
            businessProviderId: businessProviderId,
          },
        });

        if (existingProvider) {
          throw new BadRequestException('User is already a provider for this business');
        }

        // Add BUSINESS_EMPLOYEE role if not present
        if (!user.roles.includes(UserRole.BUSINESS_EMPLOYEE)) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              roles: [...user.roles, UserRole.BUSINESS_EMPLOYEE],
            },
          });
        }
      }

      // Create provider entry for business employee
      const provider = await this.prisma.provider.create({
        data: {
          userId: user.id,
          businessProviderId,
          soloProvider: false,
          isActive: true,
        },
        include: {
          user: true,
          businessProvider: true,
        },
      });

      // Update user with the name (since common fields are now in User table)
      if (dto.name) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { name: dto.name },
        });
      }

      // TODO: Send invitation SMS/email with onboarding link
      // The link should include a token that can be used to verify the user
      // For now, we'll just return the provider data

      return {
        success: true,
        message: 'Business employee invitation sent successfully',
        data: provider,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to send business employee invitation',
      };
    }
  }

  async getInviteLink(id: string) {
    try {
      // Get usage limit from env
      const usageLimit = parseInt(process.env.INVITE_LINK_USAGE_LIMIT || '1', 10);
      if (isNaN(usageLimit) || usageLimit < 1) {
        throw new Error('Invalid INVITE_LINK_USAGE_LIMIT in environment');
      }

      // Check if business provider exists
      const businessProvider = await this.prisma.businessProvider.findUnique({
        where: { id: Number(id) },
      });
      if (!businessProvider) {
        throw new NotFoundException('Business provider not found');
      }

      // Generate UUID token
      const token = uuidv4();

      // Set expiry to 12 hours from now
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

      // Store in LinkExpiryAndUsage table
      const link = await this.prisma.linkExpiryAndUsage.create({
        data: {
          businessProviderId: Number(id),
          token,
          expiresAt,
          limitConsumed: usageLimit,
        },
      });

      const inviteUrl = `${process.env.FRONTEND_BASE_URL}/onboard-employee?token=${token}`;

      // Return the invite link (token)
      return {
        success: true,
        message: 'Invite link generated successfully',
        data: {
          "inviteUrl": inviteUrl
        },
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || 'Failed to generate invite link',
      };
    }
  }
}
