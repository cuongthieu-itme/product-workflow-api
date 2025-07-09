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
        members: {
          select: {
            id: true,
            fullName: true,
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
    return this.prismaService.$transaction(async (tx) => {
      await this.validateDepartmentNameUniqueness(dto.name, undefined, tx);

      if (dto.headId) {
        await this.validateHeadUser(dto.headId, undefined, tx);
      }

      const processedMemberIds = dto.memberIds
        ? await this.validateAndProcessMemberIds(
            dto.memberIds,
            dto.headId,
            undefined,
            tx,
          )
        : [];

      const newDepartment = await tx.department.create({
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

      if (processedMemberIds.length > 0) {
        await this.assignMembersToDepartment(
          processedMemberIds,
          newDepartment.id,
          tx,
        );
      }

      const departmentWithMembers = await this.getDepartmentWithMembers(
        newDepartment.id,
        tx,
      );

      return {
        message: 'Tạo phòng ban thành công',
        data: departmentWithMembers,
      };
    });
  }

  async update(id: number, dto: UpdateDepartmentDTO) {
    return this.prismaService.$transaction(async (tx) => {
      const existingDepartment = await tx.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
      }

      if (dto.name && dto.name !== existingDepartment.name) {
        await this.validateDepartmentNameUniqueness(dto.name, id, tx);
      }

      if (dto.headId !== undefined) {
        if (dto.headId !== null) {
          await this.validateHeadUser(dto.headId, id, tx);
        }
      }

      const processedMemberIds =
        dto.memberIds !== undefined
          ? await this.validateAndProcessMemberIds(
              dto.memberIds,
              dto.headId,
              id,
              tx,
            )
          : undefined;

      const { memberIds, ...departmentData } = dto;
      await tx.department.update({
        where: { id },
        data: departmentData,
      });

      if (processedMemberIds !== undefined) {
        await this.reassignDepartmentMembers(id, processedMemberIds, tx);
      }

      const departmentWithMembers = await this.getDepartmentWithMembers(id, tx);

      return {
        message: 'Cập nhật phòng ban thành công',
        data: departmentWithMembers,
      };
    });
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

  // Private validation and helper methods
  private async validateDepartmentNameUniqueness(
    name: string,
    excludeId?: number,
    tx?: any,
  ) {
    const prisma = tx || this.prismaService;
    const whereCondition: any = { name };

    if (excludeId) {
      whereCondition.id = { not: excludeId };
    }

    const existingDepartment = await prisma.department.findFirst({
      where: whereCondition,
    });

    if (existingDepartment) {
      throw new ConflictException('Tên phòng ban đã tồn tại');
    }
  }

  private async validateHeadUser(
    headId: number,
    excludeDepartmentId?: number,
    tx?: any,
  ) {
    const prisma = tx || this.prismaService;

    // Check if user exists
    const existingHead = await prisma.user.findUnique({
      where: { id: headId },
    });

    if (!existingHead) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${headId}`);
    }

    // Check if user is already head of another department
    const whereCondition: any = { headId };
    if (excludeDepartmentId) {
      whereCondition.id = { not: excludeDepartmentId };
    }

    const existingHeadOfDepartment = await prisma.department.findFirst({
      where: whereCondition,
    });

    if (existingHeadOfDepartment) {
      throw new ConflictException(
        'Người này đã là trưởng phòng của phòng ban khác',
      );
    }
  }

  private async validateAndProcessMemberIds(
    memberIds: number[],
    headId?: number,
    departmentId?: number,
    tx?: any,
  ): Promise<number[]> {
    if (!memberIds || memberIds.length === 0) {
      return [];
    }

    const prisma = tx || this.prismaService;
    const uniqueMemberIds = [...new Set(memberIds)];

    // Check if all users exist
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: uniqueMemberIds } },
      select: { id: true, departmentId: true },
    });

    if (existingUsers.length !== uniqueMemberIds.length) {
      const foundIds = existingUsers.map((user) => user.id);
      const missingIds = uniqueMemberIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID: ${missingIds.join(', ')}`,
      );
    }

    // Check if users belong to other departments
    const usersWithOtherDepartment = existingUsers.filter(
      (user) =>
        user.departmentId !== null && user.departmentId !== departmentId,
    );

    if (usersWithOtherDepartment.length > 0) {
      const conflictIds = usersWithOtherDepartment.map((user) => user.id);
      throw new ConflictException(
        `Các người dùng với ID ${conflictIds.join(', ')} đã thuộc phòng ban khác`,
      );
    }

    // Remove head ID from member IDs to avoid duplicate assignment
    return uniqueMemberIds.filter((memberId) => memberId !== headId);
  }

  private async assignMembersToDepartment(
    memberIds: number[],
    departmentId: number,
    tx?: any,
  ) {
    const prisma = tx || this.prismaService;

    if (memberIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: memberIds } },
        data: { departmentId },
      });
    }
  }

  private async reassignDepartmentMembers(
    departmentId: number,
    newMemberIds: number[],
    tx?: any,
  ) {
    const prisma = tx || this.prismaService;

    // Remove all current members from department
    await prisma.user.updateMany({
      where: { departmentId },
      data: { departmentId: null },
    });

    // Assign new members if any
    await this.assignMembersToDepartment(newMemberIds, departmentId, tx);
  }

  private async getDepartmentWithMembers(departmentId: number, tx?: any) {
    const prisma = tx || this.prismaService;

    return prisma.department.findUnique({
      where: { id: departmentId },
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
  }
}
