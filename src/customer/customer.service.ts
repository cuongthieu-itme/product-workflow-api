import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomerDto } from './dto/filter-customer.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterCustomerDto) {
    try {
      const whereCondition: any = {};

      if (filters) {
        if (filters.fullName) {
          whereCondition.fullName = {
            contains: filters.fullName,
            mode: 'insensitive',
          };
        }

        if (filters.phoneNumber) {
          whereCondition.phoneNumber = {
            contains: filters.phoneNumber,
          };
        }

        if (filters.email) {
          whereCondition.email = {
            contains: filters.email,
            mode: 'insensitive',
          };
        }

        if (filters.gender) {
          whereCondition.gender = filters.gender;
        }

        if (filters.source) {
          whereCondition.source = filters.source;
        }

        if (filters.userId) {
          whereCondition.userId = filters.userId;
        }
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;

      const total = await this.prismaService.customer.count({
        where: whereCondition,
      });

      const data = await this.prismaService.customer.findMany({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
      });

      return { data, page, limit, total };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách khách hàng: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prismaService.customer.findUnique({
        where: { id },
      });

      if (!data) {
        throw new NotFoundException(`Không tìm thấy khách hàng với ID ${id}`);
      }

      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi tìm khách hàng: ${error.message}`);
    }
  }

  async create(userId: number, dto: CreateCustomerDto) {
    try {
      const existingCustomer = await this.prismaService.customer.findFirst({
        where: {
          OR: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
        },
      });

      if (existingCustomer) {
        if (existingCustomer.email === dto.email) {
          throw new ConflictException('Email đã tồn tại');
        }
        if (existingCustomer.phoneNumber === dto.phoneNumber) {
          throw new ConflictException('Số điện thoại đã tồn tại');
        }
      }

      const newCustomer = await this.prismaService.customer.create({
        data: {
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          source: dto.source,
          user: {
            connect: { id: userId },
          },
        },
      });

      return {
        message: 'Tạo khách hàng thành công',
        data: newCustomer,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Lỗi khi tạo khách hàng: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateCustomerDto) {
    try {
      const existingCustomer = await this.prismaService.customer.findUnique({
        where: { id },
      });

      if (!existingCustomer) {
        throw new NotFoundException(`Không tìm thấy khách hàng với ID ${id}`);
      }

      if (dto.email && dto.email !== existingCustomer.email) {
        const duplicatedEmail = await this.prismaService.customer.findFirst({
          where: {
            email: dto.email,
            id: { not: id },
          },
        });

        if (duplicatedEmail) {
          throw new ConflictException('Email đã tồn tại');
        }
      }

      if (dto.phoneNumber && dto.phoneNumber !== existingCustomer.phoneNumber) {
        const duplicatedPhone = await this.prismaService.customer.findFirst({
          where: {
            phoneNumber: dto.phoneNumber,
            id: { not: id },
          },
        });

        if (duplicatedPhone) {
          throw new ConflictException('Số điện thoại đã tồn tại');
        }
      }

      const updateData: any = { ...dto };
      if (dto.dateOfBirth) {
        updateData.dateOfBirth = new Date(dto.dateOfBirth);
      }

      const updatedCustomer = await this.prismaService.customer.update({
        where: { id },
        data: updateData,
      });

      return {
        message: 'Cập nhật khách hàng thành công',
        data: updatedCustomer,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi cập nhật khách hàng: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const existingCustomer = await this.prismaService.customer.findUnique({
        where: { id },
      });

      if (!existingCustomer) {
        throw new NotFoundException(`Không tìm thấy khách hàng với ID ${id}`);
      }

      await this.prismaService.customer.delete({ where: { id } });

      return {
        message: 'Xóa khách hàng thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi xóa khách hàng: ${error.message}`);
    }
  }
}
