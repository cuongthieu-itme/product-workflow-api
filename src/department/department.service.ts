import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  FilterDepartmentDTO,
} from './dtos';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterDepartmentDTO) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.name) {
        whereCondition.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        whereCondition.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }

      if (filters.headId !== undefined) {
        whereCondition.headId = filters.headId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.department.count({
      where: whereCondition,
    });

    const data = await this.prismaService.department.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        headId: true,
        head: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.department.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        headId: true,
        head: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        members: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateDepartmentDTO) {
    const existingDepartment = await this.prismaService.department.findUnique({
      where: { name: dto.name },
    });

    if (existingDepartment) {
      throw new ConflictException('Tên phòng ban đã tồn tại');
    }

    if (dto.headId) {
      const existingHead = await this.prismaService.user.findUnique({
        where: { id: dto.headId },
      });

      if (!existingHead) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID ${dto.headId}`,
        );
      }

      const existingHeadOfDepartment =
        await this.prismaService.department.findUnique({
          where: { headId: dto.headId },
        });

      if (existingHeadOfDepartment) {
        throw new ConflictException(
          'Người này đã là trưởng phòng của phòng ban khác',
        );
      }
    }

    if (dto.memberIds && dto.memberIds.length > 0) {
      const uniqueMemberIds = [...new Set(dto.memberIds)];

      const existingUsers = await this.prismaService.user.findMany({
        where: { id: { in: uniqueMemberIds } },
        select: { id: true, departmentId: true },
      });

      if (existingUsers.length !== uniqueMemberIds.length) {
        const foundIds = existingUsers.map((user) => user.id);
        const missingIds = uniqueMemberIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID: ${missingIds.join(', ')}`,
        );
      }

      const usersWithDepartment = existingUsers.filter(
        (user) => user.departmentId !== null,
      );
      if (usersWithDepartment.length > 0) {
        const conflictIds = usersWithDepartment.map((user) => user.id);
        throw new ConflictException(
          `Các người dùng với ID ${conflictIds.join(', ')} đã thuộc phòng ban khác`,
        );
      }

      dto.memberIds = uniqueMemberIds.filter((id) => id !== dto.headId);
    }

    const newDepartment = await this.prismaService.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        headId: dto.headId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        headId: true,
        head: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    // Assign members to the department if provided
    if (dto.memberIds && dto.memberIds.length > 0) {
      await this.prismaService.user.updateMany({
        where: { id: { in: dto.memberIds } },
        data: { departmentId: newDepartment.id },
      });
    }

    // Fetch the complete department data with members
    const departmentWithMembers =
      await this.prismaService.department.findUnique({
        where: { id: newDepartment.id },
        select: {
          id: true,
          name: true,
          description: true,
          headId: true,
          head: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
            },
          },
          members: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

    return {
      message: 'Tạo phòng ban thành công',
      data: departmentWithMembers,
    };
  }

  async update(id: number, dto: UpdateDepartmentDTO) {
    const existingDepartment = await this.prismaService.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
    }

    if (dto.name && dto.name !== existingDepartment.name) {
      const duplicatedName = await this.prismaService.department.findUnique({
        where: { name: dto.name },
      });

      if (duplicatedName) {
        throw new ConflictException('Tên phòng ban đã tồn tại');
      }
    }

    if (dto.headId !== undefined) {
      if (dto.headId !== null) {
        const existingHead = await this.prismaService.user.findUnique({
          where: { id: dto.headId },
        });

        if (!existingHead) {
          throw new NotFoundException(
            `Không tìm thấy người dùng với ID ${dto.headId}`,
          );
        }

        const existingHeadOfDepartment =
          await this.prismaService.department.findFirst({
            where: {
              headId: dto.headId,
              id: { not: id },
            },
          });

        if (existingHeadOfDepartment) {
          throw new ConflictException(
            'Người này đã là trưởng phòng của phòng ban khác',
          );
        }
      }
    }

    const updatedDepartment = await this.prismaService.department.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        description: true,
        headId: true,
        head: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật phòng ban thành công',
      data: updatedDepartment,
    };
  }

  async delete(id: number) {
    const existingDepartment = await this.prismaService.department.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!existingDepartment) {
      throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
    }

    if (existingDepartment.members.length > 0) {
      throw new ConflictException(
        'Không thể xóa phòng ban khi còn thành viên. Vui lòng chuyển tất cả thành viên sang phòng ban khác trước khi xóa.',
      );
    }

    await this.prismaService.department.delete({ where: { id } });

    return {
      message: 'Xóa phòng ban thành công',
    };
  }

  async findDepartmentByName(name: string) {
    return this.prismaService.department.findUnique({
      where: { name },
    });
  }

  async assignUserToDepartment(userId: number, departmentId: number) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${userId}`);
    }

    const existingDepartment = await this.prismaService.department.findUnique({
      where: { id: departmentId },
    });

    if (!existingDepartment) {
      throw new NotFoundException(
        `Không tìm thấy phòng ban với ID ${departmentId}`,
      );
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { departmentId },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Phân công người dùng vào phòng ban thành công',
      data: updatedUser,
    };
  }

  async removeUserFromDepartment(userId: number) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${userId}`);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { departmentId: null },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
      },
    });

    return {
      message: 'Loại bỏ người dùng khỏi phòng ban thành công',
      data: updatedUser,
    };
  }
}
