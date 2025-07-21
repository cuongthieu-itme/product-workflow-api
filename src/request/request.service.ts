import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterRequestDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.title) {
        whereCondition.title = {
          contains: filters.title,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        whereCondition.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }

      if (filters.source) {
        whereCondition.source = filters.source;
      }

      if (filters.customerId) {
        whereCondition.customerId = filters.customerId;
      }

      if (filters.sourceOtherId) {
        whereCondition.sourceOtherId = filters.sourceOtherId;
      }

      if (filters.statusProductId) {
        whereCondition.statusProductId = filters.statusProductId;
      }

      if (filters.materialType) {
        whereCondition.requestMaterials = {
          some: {
            material: {
              type: filters.materialType,
              isActive: true,
            },
          },
        };
      }

      if (filters.status) {
        whereCondition.status = filters.status;
      }
    }

    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 10, 100);

    const total = await this.prismaService.request.count({
      where: whereCondition,
    });

    const data = await this.prismaService.request.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: true,
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prismaService.request.findUnique({
      where: { id },
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: {
              include: {
                origin: true,
              },
            },
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateRequestDto) {
    // Validate customer if provided
    if (dto.customerId) {
      const customerExists = await this.prismaService.customer.findUnique({
        where: { id: dto.customerId },
        select: { id: true },
      });

      if (!customerExists) {
        throw new NotFoundException(
          `Không tìm thấy khách hàng với ID ${dto.customerId}`,
        );
      }
    }

    // Validate sourceOther if provided
    if (dto.sourceOtherId) {
      const sourceOtherExists = await this.prismaService.sourceOther.findUnique(
        {
          where: { id: dto.sourceOtherId },
          select: { id: true },
        },
      );

      if (!sourceOtherExists) {
        throw new NotFoundException(
          `Không tìm thấy nguồn khác với ID ${dto.sourceOtherId}`,
        );
      }
    }

    // Validate and process materials
    let validatedMaterials: any[] = [];
    if (dto.materials && dto.materials.length > 0) {
      // Remove duplicate materials based on materialId
      const uniqueMaterials = dto.materials.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.materialId === item.materialId),
      );

      // Get all material IDs
      const materialIds = uniqueMaterials.map((m) => m.materialId);

      // Fetch materials from database
      const existingMaterials = await this.prismaService.material.findMany({
        where: {
          id: { in: materialIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          quantity: true,
          type: true,
        },
      });

      // Check if all materials exist and are active
      if (existingMaterials.length !== materialIds.length) {
        const existingIds = existingMaterials.map((m) => m.id);
        const missingIds = materialIds.filter(
          (id) => !existingIds.includes(id),
        );
        throw new NotFoundException(
          `Không tìm thấy vật liệu hoạt động với ID: ${missingIds.join(', ')}`,
        );
      }

      // Validate each material
      for (const reqMaterial of uniqueMaterials) {
        // Check quantity is positive
        if (reqMaterial.quantity <= 0) {
          throw new BadRequestException(
            `Số lượng phải lớn hơn 0 cho vật liệu với ID ${reqMaterial.materialId}`,
          );
        }

        // Find the material in database
        const material = existingMaterials.find(
          (m) => m.id === reqMaterial.materialId,
        );

        if (!material) {
          throw new NotFoundException(
            `Không tìm thấy vật liệu với ID ${reqMaterial.materialId}`,
          );
        }

        // Validate material type matches what client specified
        if (material.type !== reqMaterial.materialType) {
          throw new BadRequestException(
            `Vật liệu ${material.name} có loại ${material.type}, không phải ${reqMaterial.materialType}`,
          );
        }

        // Check if requested quantity is available
        if (reqMaterial.quantity > material.quantity) {
          throw new BadRequestException(
            `Số lượng yêu cầu (${reqMaterial.quantity}) vượt quá số lượng có sẵn (${material.quantity}) của vật liệu ${material.name}`,
          );
        }
      }

      validatedMaterials = uniqueMaterials;
    }

    // Create the request
    const newRequest = await this.prismaService.request.create({
      data: {
        title: dto.title,
        description: dto.description,
        productLink: dto.productLink || [],
        media: dto.media || [],
        source: dto.source,
        customerId: dto.customerId || null,
        sourceOtherId: dto.sourceOtherId || null,
        requestMaterials:
          validatedMaterials.length > 0
            ? {
                create: validatedMaterials.map((m) => ({
                  materialId: m.materialId,
                  quantity: m.quantity,
                })),
              }
            : undefined,
      },
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: true,
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    return {
      message: 'Tạo yêu cầu thành công',
      data: newRequest,
    };
  }

  async update(id: number, dto: UpdateRequestDto) {
    // Check if request exists
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      include: {
        requestMaterials: {
          select: {
            id: true,
            materialId: true,
            quantity: true,
          },
        },
      },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    // Validate customer if being updated
    if (
      dto.customerId !== undefined &&
      dto.customerId !== existingRequest.customerId
    ) {
      if (dto.customerId !== null) {
        const customerExists = await this.prismaService.customer.findUnique({
          where: { id: dto.customerId },
          select: { id: true },
        });

        if (!customerExists) {
          throw new NotFoundException(
            `Không tìm thấy khách hàng với ID ${dto.customerId}`,
          );
        }
      }
    }

    // Validate sourceOther if being updated
    if (
      dto.sourceOtherId !== undefined &&
      dto.sourceOtherId !== existingRequest.sourceOtherId
    ) {
      if (dto.sourceOtherId !== null) {
        const sourceOtherExists =
          await this.prismaService.sourceOther.findUnique({
            where: { id: dto.sourceOtherId },
            select: { id: true },
          });

        if (!sourceOtherExists) {
          throw new NotFoundException(
            `Không tìm thấy nguồn khác với ID ${dto.sourceOtherId}`,
          );
        }
      }
    }

    // Validate and process materials if being updated
    let validatedMaterials: any[] = [];
    if (dto.materials !== undefined) {
      if (dto.materials.length > 0) {
        // Remove duplicate materials based on materialId
        const uniqueMaterials = dto.materials.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.materialId === item.materialId),
        );

        // Get all material IDs
        const materialIds = uniqueMaterials.map((m) => m.materialId);

        // Fetch materials from database
        const existingMaterials = await this.prismaService.material.findMany({
          where: {
            id: { in: materialIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            quantity: true,
            type: true,
          },
        });

        // Check if all materials exist and are active
        if (existingMaterials.length !== materialIds.length) {
          const existingIds = existingMaterials.map((m) => m.id);
          const missingIds = materialIds.filter(
            (id) => !existingIds.includes(id),
          );
          throw new NotFoundException(
            `Không tìm thấy vật liệu hoạt động với ID: ${missingIds.join(', ')}`,
          );
        }

        // Validate each material
        for (const reqMaterial of uniqueMaterials) {
          // Check quantity is positive
          if (reqMaterial.quantity <= 0) {
            throw new BadRequestException(
              `Số lượng phải lớn hơn 0 cho vật liệu với ID ${reqMaterial.materialId}`,
            );
          }

          // Find the material in database
          const material = existingMaterials.find(
            (m) => m.id === reqMaterial.materialId,
          );

          if (!material) {
            throw new NotFoundException(
              `Không tìm thấy vật liệu với ID ${reqMaterial.materialId}`,
            );
          }

          // Validate material type matches what client specified
          if (material.type !== reqMaterial.materialType) {
            throw new BadRequestException(
              `Vật liệu ${material.name} có loại ${material.type}, không phải ${reqMaterial.materialType}`,
            );
          }

          // Check if requested quantity is available
          if (reqMaterial.quantity > material.quantity) {
            throw new BadRequestException(
              `Số lượng yêu cầu (${reqMaterial.quantity}) vượt quá số lượng có sẵn (${material.quantity}) của vật liệu ${material.name}`,
            );
          }
        }

        validatedMaterials = uniqueMaterials;
      }
      // If dto.materials is empty array, validatedMaterials will remain empty
      // This means we want to remove all materials from the request
    }

    // Update request in transaction
    const updatedRequest = await this.prismaService.$transaction(async (tx) => {
      // Update materials if materials field is provided in DTO
      if (dto.materials !== undefined) {
        // Delete all existing request materials
        await tx.requestMaterial.deleteMany({
          where: { requestId: id },
        });

        // Create new request materials if any
        if (validatedMaterials.length > 0) {
          await tx.requestMaterial.createMany({
            data: validatedMaterials.map((m) => ({
              requestId: id,
              materialId: m.materialId,
              quantity: m.quantity,
            })),
          });
        }
      }

      // Prepare update data for request
      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.productLink !== undefined)
        updateData.productLink = dto.productLink;
      if (dto.media !== undefined) updateData.media = dto.media;
      if (dto.source !== undefined) updateData.source = dto.source;
      if (dto.customerId !== undefined) updateData.customerId = dto.customerId;
      if (dto.sourceOtherId !== undefined)
        updateData.sourceOtherId = dto.sourceOtherId;

      // Update the request
      return await tx.request.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          sourceOther: true,
          requestMaterials: {
            include: {
              material: true,
            },
            orderBy: {
              material: {
                name: 'asc',
              },
            },
          },
        },
      });
    });

    return {
      message: 'Cập nhật yêu cầu thành công',
      data: updatedRequest,
    };
  }

  async updateStatus(id: number, status: RequestStatus) {
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    if (existingRequest.status === status) {
      throw new BadRequestException(
        'Trạng thái mới trùng với trạng thái hiện tại',
      );
    }

    const updatedRequest = await this.prismaService.request.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: true,
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    return {
      message: 'Cập nhật trạng thái yêu cầu thành công',
      data: updatedRequest,
    };
  }

  async remove(id: number) {
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    await this.prismaService.request.delete({ where: { id } });

    return {
      message: 'Xóa yêu cầu thành công',
    };
  }

  async getMaterialsByType(type?: string) {
    const materials = await this.prismaService.material.findMany({
      where: {
        isActive: true,
        ...(type && { type: type as any }),
      },
      include: {
        origin: true,
      },
      orderBy: { name: 'asc' },
    });

    return { data: materials };
  }

  async getRequestStatistics() {
    const [total, bySource, materialStats] = await Promise.all([
      this.prismaService.request.count(),

      this.prismaService.request.groupBy({
        by: ['source'],
        _count: true,
      }),

      this.prismaService.requestMaterial.findMany({
        select: {
          requestId: true,
          material: {
            select: {
              type: true,
            },
          },
        },
      }),
    ]);

    // Map requestId -> unique material types
    const requestMaterialTypeMap = new Map<number, Set<string>>();
    materialStats.forEach(({ requestId, material }) => {
      if (!requestMaterialTypeMap.has(requestId)) {
        requestMaterialTypeMap.set(requestId, new Set());
      }
      requestMaterialTypeMap.get(requestId)!.add(material.type);
    });

    // Aggregate by type
    const materialTypeStats: Record<string, number> = {};
    for (const types of requestMaterialTypeMap.values()) {
      types.forEach((type) => {
        materialTypeStats[type] = (materialTypeStats[type] || 0) + 1;
      });
    }

    return {
      total,
      bySource: bySource.map((item) => ({
        source: item.source,
        count: item._count,
      })),
      byMaterialType: Object.entries(materialTypeStats).map(
        ([type, count]) => ({
          type,
          count,
        }),
      ),
    };
  }
}
