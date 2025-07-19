import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

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
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        media: true,
        source: true,
        customerId: true,
        sourceOtherId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
          },
        },
        requestMaterials: {
          select: {
            id: true,
            quantity: true,
            material: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                type: true,
                image: true,
                isActive: true,
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
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        media: true,
        source: true,
        customerId: true,
        sourceOtherId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
          },
        },
        requestMaterials: {
          select: {
            id: true,
            quantity: true,
            material: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                origin: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                description: true,
                image: true,
                type: true,
                quantity: true,
                isActive: true,
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

    let validatedMaterials: any[] = [];
    if (dto.materials && dto.materials.length > 0) {
      const uniqueMaterials = dto.materials.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.materialId === item.materialId),
      );

      const materialIds = uniqueMaterials.map((m) => m.materialId);
      const existingMaterials = await this.prismaService.material.findMany({
        where: {
          id: { in: materialIds },
          isActive: true,
          ...(dto.materialType && { type: dto.materialType }),
        },
        select: {
          id: true,
          name: true,
          quantity: true,
          type: true,
        },
      });

      if (existingMaterials.length !== materialIds.length) {
        const existingIds = existingMaterials.map((m) => m.id);
        const missingIds = materialIds.filter(
          (id) => !existingIds.includes(id),
        );
        throw new NotFoundException(
          `Không tìm thấy vật liệu hoạt động với ID: ${missingIds.join(', ')}`,
        );
      }

      for (const reqMaterial of uniqueMaterials) {
        if (reqMaterial.quantity <= 0) {
          throw new BadRequestException(
            `Số lượng phải lớn hơn 0 cho vật liệu với ID ${reqMaterial.materialId}`,
          );
        }

        const material = existingMaterials.find(
          (m) => m.id === reqMaterial.materialId,
        );
        if (material && reqMaterial.quantity > material.quantity) {
          throw new BadRequestException(
            `Số lượng yêu cầu (${reqMaterial.quantity}) vượt quá số lượng có sẵn (${material.quantity}) của vật liệu ${material.name}`,
          );
        }
      }

      validatedMaterials = uniqueMaterials;
    }

    const newRequest = await this.prismaService.request.create({
      data: {
        title: dto.title,
        description: dto.description,
        productLink: dto.productLink || [],
        media: dto.media || [],
        source: dto.source,
        customerId: dto.customerId,
        sourceOtherId: dto.sourceOtherId,
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
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        media: true,
        source: true,
        customerId: true,
        sourceOtherId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
          },
        },
        requestMaterials: {
          select: {
            id: true,
            quantity: true,
            material: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                type: true,
                image: true,
              },
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

    let validatedMaterials: any[] = [];
    if (dto.materials !== undefined) {
      if (dto.materials.length > 0) {
        const uniqueMaterials = dto.materials.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.materialId === item.materialId),
        );

        const materialIds = uniqueMaterials.map((m) => m.materialId);
        const existingMaterials = await this.prismaService.material.findMany({
          where: {
            id: { in: materialIds },
            isActive: true,
            ...(dto.materialType && { type: dto.materialType }),
          },
          select: {
            id: true,
            name: true,
            quantity: true,
            type: true,
          },
        });

        if (existingMaterials.length !== materialIds.length) {
          const existingIds = existingMaterials.map((m) => m.id);
          const missingIds = materialIds.filter(
            (id) => !existingIds.includes(id),
          );
          throw new NotFoundException(
            `Không tìm thấy vật liệu hoạt động với ID: ${missingIds.join(', ')}`,
          );
        }

        for (const reqMaterial of uniqueMaterials) {
          if (reqMaterial.quantity <= 0) {
            throw new BadRequestException(
              `Số lượng phải lớn hơn 0 cho vật liệu với ID ${reqMaterial.materialId}`,
            );
          }

          const material = existingMaterials.find(
            (m) => m.id === reqMaterial.materialId,
          );
          if (material && reqMaterial.quantity > material.quantity) {
            throw new BadRequestException(
              `Số lượng yêu cầu (${reqMaterial.quantity}) vượt quá số lượng có sẵn (${material.quantity}) của vật liệu ${material.name}`,
            );
          }
        }

        validatedMaterials = uniqueMaterials;
      }
    }

    const updatedRequest = await this.prismaService.$transaction(async (tx) => {
      if (dto.materials !== undefined) {
        await tx.requestMaterial.deleteMany({
          where: { requestId: id },
        });

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

      return await tx.request.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          title: true,
          description: true,
          productLink: true,
          media: true,
          source: true,
          customerId: true,
          sourceOtherId: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          sourceOther: {
            select: {
              id: true,
              name: true,
            },
          },
          requestMaterials: {
            select: {
              id: true,
              quantity: true,
              material: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  unit: true,
                  type: true,
                  image: true,
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
    });

    return {
      message: 'Cập nhật yêu cầu thành công',
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
      select: {
        id: true,
        name: true,
        code: true,
        unit: true,
        quantity: true,
        type: true,
        image: true,
        origin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { data: materials };
  }

  async getRequestStatistics() {
    const [total, bySource, byMaterialType] = await Promise.all([
      this.prismaService.request.count(),
      this.prismaService.request.groupBy({
        by: ['source'],
        _count: true,
      }),
      this.prismaService.request.findMany({
        select: {
          id: true,
          requestMaterials: {
            select: {
              material: {
                select: {
                  type: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const materialTypeStats = byMaterialType.reduce(
      (acc, request) => {
        const types = new Set(
          request.requestMaterials.map((rm) => rm.material.type),
        );
        types.forEach((type) => {
          acc[type] = (acc[type] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

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
