import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BroadcastService } from 'src/broadcast/broadcast.service';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import {
  AddMaterialToRequestDto,
  RemoveMaterialFromRequestDto,
} from './dto/create-request.dto';
import { SaveOutputDto } from './dto/save-output.dto';
import {
  RequestStatus,
  OutputType,
  MaterialType,
  NotificationType,
} from '@prisma/client';
import { CodeGenerationService } from 'src/common/code-generation/code-generation.service';

@Injectable()
export class RequestService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationAdminService: BroadcastService,
    private readonly codeGenerationService: CodeGenerationService,
  ) {}

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

      if (filters.userId) {
        whereCondition.userId = filters.userId;
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
        createdBy: true,
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: {
              include: {
                origin: true,
                requestInput: true,
                requestMaterials: true,
              },
            },
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
        procedureHistory: {
          include: {
            subprocessesHistory: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    userName: true,
                    email: true,
                    phoneNumber: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                step: 'asc',
              },
            },
          },
        },
        approvalInfo: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.request.findUnique({
      where: { id },
      include: {
        createdBy: true,
        customer: true,
        sourceOther: true,
        statusProduct: {
          include: {
            procedure: {
              include: {
                subprocesses: true,
              },
            },
          },
        },
        requestMaterials: {
          include: {
            material: {
              include: {
                origin: true,
                requestInput: true,
                requestMaterials: true,
              },
            },
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
        procedureHistory: {
          include: {
            subprocessesHistory: {
              include: {
                fieldSubprocess: true,
                user: {
                  select: {
                    fullName: true,
                    userName: true,
                    email: true,
                    phoneNumber: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                step: 'asc',
              },
            },
          },
        },
        approvalInfo: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return { data };
  }

  async create(createRequestDto: CreateRequestDto) {
    const {
      title,
      description,
      productLink,
      media,
      source,
      priority,
      createdById,
      customerId,
      sourceOtherId,
      statusProductId,
      materials,
    } = createRequestDto;

    await this.validateRelationships(createRequestDto);

    if (materials && materials.length > 0) {
      await this.validateMaterials(materials.map((m) => m.materialId));

      const materialIds = materials.map((m) => m.materialId);
      const duplicates = materialIds.filter(
        (id, index) => materialIds.indexOf(id) !== index,
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Phát hiện nguyên vật liệu bị trùng: ${duplicates.join(', ')}`,
        );
      }
    }

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const generatedCode =
          await this.codeGenerationService.generateRequestCode(source);

        if (!generatedCode) {
          throw new BadRequestException(
            'Không thể tạo mã yêu cầu (code). Vui lòng kiểm tra lại source hoặc cấu hình sinh mã.',
          );
        }

        const newRequest = await prisma.request.create({
          data: {
            title,
            description: description || null,
            productLink: productLink || [],
            media: media || [],
            source,
            priority,
            status: 'PENDING',
            createdById: createdById || null,
            customerId: customerId || null,
            sourceOtherId: sourceOtherId || null,
            statusProductId: statusProductId || null,
            code: generatedCode,
          },
        });

        if (materials && materials.length > 0) {
          await prisma.requestMaterial.createMany({
            data: materials.map((material) => ({
              requestId: newRequest.id,
              materialId: material.materialId,
              quantity: material.quantity,
            })),
          });

          for (const material of materials) {
            if (material.requestInput) {
              const requestInputData = {
                quantity: material.requestInput.quantity || null,
                expectedDate: material.requestInput.expectedDate
                  ? new Date(material.requestInput.expectedDate)
                  : null,
                supplier: material.requestInput.supplier || null,
                sourceCountry: material.requestInput.sourceCountry || null,
                price: material.requestInput.price || null,
                reason: material.requestInput.reason || null,
                materialId: material.materialId,
              };

              const existingRequestInput = await prisma.requestInput.findUnique(
                {
                  where: { materialId: material.materialId },
                },
              );

              if (existingRequestInput) {
                await prisma.requestInput.update({
                  where: { materialId: material.materialId },
                  data: {
                    quantity: requestInputData.quantity,
                    expectedDate: requestInputData.expectedDate,
                    supplier: requestInputData.supplier,
                    sourceCountry: requestInputData.sourceCountry,
                    price: requestInputData.price,
                    reason: requestInputData.reason,
                  },
                });
              } else {
                await prisma.requestInput.create({
                  data: requestInputData,
                });
              }
            }
          }
        }

        const infoCreatedBy = await prisma.user.findUnique({
          where: { id: createdById },
        });

        await this.notificationAdminService.create(createdById || 0, {
          title: 'Yêu cầu mới',
          content: `Yêu cầu mới bởi ${infoCreatedBy?.fullName}`,
          type: 'REQUEST',
        });

        // Return the complete request with all relations
        return await this.findByIdInternal(newRequest.id, prisma);
      });
    } catch (error) {
      console.error('Lỗi khi tạo yêu cầu:', error);

      // Re-throw known exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Handle Prisma errors
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin.',
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Dữ liệu tham chiếu không hợp lệ. Vui lòng kiểm tra lại các ID.',
        );
      }

      // Generic error
      throw new BadRequestException(
        'Tạo yêu cầu thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.',
      );
    }
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    const {
      title,
      description,
      productLink,
      media,
      source,
      priority,
      createdById,
      customerId,
      sourceOtherId,
      statusProductId,
      materials,
    } = updateRequestDto;

    // Check if request exists first
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      include: {
        requestMaterials: true,
      },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    // Validate relationships if provided
    await this.validateRelationships(updateRequestDto);

    // Validate materials if provided
    if (materials && materials.length > 0) {
      await this.validateMaterials(materials.map((m) => m.materialId));

      // Check for duplicate materials
      const materialIds = materials.map((m) => m.materialId);
      const duplicates = materialIds.filter(
        (materialId, index) => materialIds.indexOf(materialId) !== index,
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Phát hiện nguyên vật liệu bị trùng: ${duplicates.join(', ')}`,
        );
      }
    }

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Prepare update data for main request
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (productLink !== undefined)
          updateData.productLink = productLink || [];
        if (media !== undefined) updateData.media = media || [];
        if (source !== undefined) updateData.source = source;
        if (priority !== undefined) updateData.priority = priority;
        if (createdById !== undefined) updateData.createdById = createdById;
        if (customerId !== undefined) updateData.customerId = customerId;
        if (sourceOtherId !== undefined)
          updateData.sourceOtherId = sourceOtherId;
        if (statusProductId !== undefined)
          updateData.statusProductId = statusProductId;

        // Update main request if there's data to update
        if (Object.keys(updateData).length > 0) {
          await prisma.request.update({
            where: { id },
            data: updateData,
          });
        }

        // Handle materials update if provided
        if (materials !== undefined) {
          if (materials.length === 0) {
            // If empty array, remove all materials
            await this.removeMaterialsAndInputs(id, prisma);
          } else {
            // Get current material IDs
            const currentMaterialIds = existingRequest.requestMaterials.map(
              (rm) => rm.materialId,
            );
            const newMaterialIds = materials.map((m) => m.materialId);

            // Find materials to remove
            const materialsToRemove = currentMaterialIds.filter(
              (materialId) => !newMaterialIds.includes(materialId),
            );

            // Remove old materials and their inputs
            if (materialsToRemove.length > 0) {
              await this.removeMaterialsAndInputs(
                id,
                prisma,
                materialsToRemove,
              );
            }

            // Process new/updated materials
            for (const material of materials) {
              const existingRequestMaterial =
                existingRequest.requestMaterials.find(
                  (rm) => rm.materialId === material.materialId,
                );

              if (existingRequestMaterial) {
                // Update existing RequestMaterial
                await prisma.requestMaterial.update({
                  where: {
                    requestId_materialId: {
                      requestId: id,
                      materialId: material.materialId,
                    },
                  },
                  data: {
                    quantity: material.quantity,
                  },
                });
              } else {
                // Create new RequestMaterial
                await prisma.requestMaterial.create({
                  data: {
                    requestId: id,
                    materialId: material.materialId,
                    quantity: material.quantity,
                  },
                });
              }

              // Handle RequestInput for this material
              await this.upsertRequestInput(material, prisma);
            }
          }
        }

        const infoCreatedBy = await prisma.user.findUnique({
          where: { id: existingRequest.createdById },
        });

        await this.notificationAdminService.create(
          existingRequest.createdById || 0,
          {
            title: 'Yêu cầu cập nhật',
            content: `Yêu cầu cập nhật bởi ${infoCreatedBy?.fullName}`,
            type: 'REQUEST',
          },
        );

        // Return updated request with all relations
        return await this.findByIdInternal(id, this.prismaService);
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu cầu:', error);

      // Re-throw known exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Handle Prisma errors
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin.',
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Dữ liệu tham chiếu không hợp lệ. Vui lòng kiểm tra lại các ID.',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy bản ghi để cập nhật.');
      }

      // Generic error
      throw new BadRequestException(
        'Cập nhật yêu cầu thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.',
      );
    }
  }

  private async validateMaterials(materialIds: number[]): Promise<void> {
    if (materialIds.length === 0) return;

    const materials = await this.prismaService.material.findMany({
      where: {
        id: { in: materialIds },
        isActive: true,
      },
    });

    const foundIds = materials.map((m) => m.id);
    const missingIds = materialIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy nguyên vật liệu đang hoạt động với ID: ${missingIds.join(', ')}`,
      );
    }
  }

  private async findByIdInternal(id: number, prisma: any = this.prismaService) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
            specifically: true,
          },
        },
        statusProduct: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        requestMaterials: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                requestInput: {
                  select: {
                    id: true,
                    quantity: true,
                    expectedDate: true,
                    supplier: true,
                    sourceCountry: true,
                    price: true,
                    reason: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return request;
  }

  private async removeMaterialsAndInputs(
    requestId: number,
    prisma: any,
    materialIds?: number[],
  ) {
    const whereClause = materialIds
      ? {
          requestId,
          materialId: { in: materialIds },
        }
      : { requestId };

    // Get materials to be removed
    const materialsToRemove = await prisma.requestMaterial.findMany({
      where: whereClause,
      select: { materialId: true },
    });

    const materialIdsToRemove = materialsToRemove.map((m) => m.materialId);

    // Remove RequestInputs for these materials
    if (materialIdsToRemove.length > 0) {
      await prisma.requestInput.deleteMany({
        where: {
          materialId: { in: materialIdsToRemove },
        },
      });
    }

    // Remove RequestMaterials
    await prisma.requestMaterial.deleteMany({
      where: whereClause,
    });
  }

  private async upsertRequestInput(
    material: { materialId: number; requestInput?: any },
    prisma: any,
  ) {
    if (!material.requestInput) {
      // If no requestInput provided, remove existing one if it exists
      await prisma.requestInput.deleteMany({
        where: { materialId: material.materialId },
      });
      return;
    }

    const requestInputData = {
      quantity: material.requestInput.quantity || null,
      expectedDate: material.requestInput.expectedDate
        ? new Date(material.requestInput.expectedDate)
        : null,
      supplier: material.requestInput.supplier || null,
      sourceCountry: material.requestInput.sourceCountry || null,
      price: material.requestInput.price || null,
      reason: material.requestInput.reason || null,
      materialId: material.materialId,
    };

    // Use upsert to create or update RequestInput
    await prisma.requestInput.upsert({
      where: { materialId: material.materialId },
      update: {
        quantity: requestInputData.quantity,
        expectedDate: requestInputData.expectedDate,
        supplier: requestInputData.supplier,
        sourceCountry: requestInputData.sourceCountry,
        price: requestInputData.price,
        reason: requestInputData.reason,
      },
      create: requestInputData,
    });
  }

  // Overloaded method for both Create and Update DTOs
  private async validateRelationships(
    dto: CreateRequestDto | UpdateRequestDto,
  ): Promise<void> {
    const validationPromises = [];

    // For UpdateRequestDto, only validate if the field is explicitly provided (not undefined)
    // For CreateRequestDto, validate if the field exists
    if (dto.createdById !== undefined && dto.createdById !== null) {
      validationPromises.push(
        this.prismaService.user
          .findUnique({
            where: { id: dto.createdById },
          })
          .then((user) => {
            if (!user) {
              throw new NotFoundException(
                `Không tìm thấy người dùng với ID ${dto.createdById}`,
              );
            }
          }),
      );
    }

    if (dto.customerId !== undefined && dto.customerId !== null) {
      validationPromises.push(
        this.prismaService.customer
          .findUnique({
            where: { id: dto.customerId },
          })
          .then((customer) => {
            if (!customer) {
              throw new NotFoundException(
                `Không tìm thấy khách hàng với ID ${dto.customerId}`,
              );
            }
          }),
      );
    }

    if (dto.sourceOtherId !== undefined && dto.sourceOtherId !== null) {
      validationPromises.push(
        this.prismaService.sourceOther
          .findUnique({
            where: { id: dto.sourceOtherId },
          })
          .then((sourceOther) => {
            if (!sourceOther) {
              throw new NotFoundException(
                `Không tìm thấy nguồn khác với ID ${dto.sourceOtherId}`,
              );
            }
          }),
      );
    }

    if (dto.statusProductId !== undefined && dto.statusProductId !== null) {
      validationPromises.push(
        this.prismaService.statusProduct
          .findUnique({
            where: { id: dto.statusProductId },
          })
          .then((statusProduct) => {
            if (!statusProduct) {
              throw new NotFoundException(
                `Không tìm thấy trạng thái sản phẩm với ID ${dto.statusProductId}`,
              );
            }
          }),
      );
    }

    await Promise.all(validationPromises);
  }

  async updateStatusAndSaveHistory(id: number, dto: UpdateRequestStatusDto) {
    return this.prismaService.$transaction(async (prisma) => {
      // 1. Lấy request hiện tại
      const request = await this.getRequestWithDetails(prisma, id);

      // 2. Validate dữ liệu đầu vào
      this.validateStatusUpdate(request, dto);

      // 3. Cập nhật request
      const updatedRequest = await this.updateRequestData(
        prisma,
        id,
        dto,
        request,
      );

      // 4. Xử lý procedure history nếu cần
      const assignedUserIds = await this.handleProcedureHistory(
        prisma,
        updatedRequest,
        dto.statusProductId,
      );

      await this.handleRequestApprovalInfo(prisma, id, dto);

      // 5. Tạo thông báo cho các user được gán ngẫu nhiên (nếu có)
      if (assignedUserIds && assignedUserIds.length > 0) {
        const uniqueUserIds = Array.from(new Set(assignedUserIds));
        await prisma.broadcast.createMany({
          data: uniqueUserIds.map((userId) => ({
            title: 'Phân công mới',
            content: `Bạn được phân công xử lý yêu cầu ${updatedRequest.code}`,
            type: NotificationType.REQUEST,
            userId,
          })),
        });
      }

      return updatedRequest;
    });
  }

  private async getRequestWithDetails(prisma: any, id: number) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        statusProduct: {
          include: {
            procedure: {
              include: {
                subprocesses: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return request;
  }

  private validateStatusUpdate(request: any, dto: UpdateRequestStatusDto) {
    // Tránh cập nhật trùng trạng thái
    if (dto.status && dto.status === request.status) {
      throw new BadRequestException(
        'Trạng thái mới trùng với trạng thái hiện tại',
      );
    }

    if (dto.status === ('HOLD' as RequestStatus) && !dto.holdReason) {
      throw new BadRequestException(
        'Lý do tạm hoãn (holdReason) là bắt buộc khi trạng thái là HOLD',
      );
    }

    if (dto.status === ('REJECTED' as RequestStatus) && !dto.denyReason) {
      throw new BadRequestException(
        'Lý do từ chối (denyReason) là bắt buộc khi trạng thái là REJECTED',
      );
    }

    if (dto.status === ('APPROVED' as RequestStatus) && !dto.productionPlan) {
      throw new BadRequestException(
        'Kế hoạch sản xuất (productionPlan) là bắt buộc khi trạng thái là APPROVED',
      );
    }
  }

  private async updateRequestData(
    prisma: any,
    id: number,
    dto: UpdateRequestStatusDto,
    request: any,
  ) {
    const updateData: Partial<{ status: any; statusProductId: any }> = {};

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.statusProductId !== undefined) {
      updateData.statusProductId = dto.statusProductId;
    }

    if (Object.keys(updateData).length === 0) {
      return request;
    }

    return await prisma.request.update({
      where: { id },
      data: updateData,
    });
  }

  private async handleProcedureHistory(
    prisma: any,
    request: any,
    newStatusProductId?: number,
  ): Promise<number[] | void> {
    const statusProductId = newStatusProductId ?? request.statusProductId;

    if (!statusProductId) {
      return;
    }

    if (request.procedureHistoryId) {
      return;
    }

    const statusProduct = await this.getStatusProductWithProcedure(
      prisma,
      statusProductId,
    );

    if (!statusProduct?.procedure) {
      return;
    }

    const { procedureHistory, assignedUserIds } =
      await this.createProcedureSnapshot(prisma, statusProduct.procedure);

    await this.linkProcedureHistoryToRequest(
      prisma,
      request.id,
      procedureHistory.id,
    );

    return assignedUserIds;
  }

  private async getStatusProductWithProcedure(
    prisma: any,
    statusProductId: number,
  ) {
    return await prisma.statusProduct.findUnique({
      where: { id: statusProductId },
      include: {
        procedure: {
          include: {
            subprocesses: true,
          },
        },
      },
    });
  }

  private async createProcedureSnapshot(prisma: any, procedure: any) {
    const procedureHistory = await prisma.procedureHistory.create({
      data: {
        name: procedure.name,
        description: procedure.description,
        version: procedure.version,
      },
    });

    let assignedUserIds: number[] = [];
    if (procedure.subprocesses?.length > 0) {
      assignedUserIds = await this.createSubprocessHistories(
        prisma,
        procedure.subprocesses,
        procedureHistory.id,
      );
    }

    return { procedureHistory, assignedUserIds };
  }

  private async createSubprocessHistories(
    prisma: any,
    subprocesses: any[],
    procedureHistoryId: number,
  ) {
    const departmentUserMap = new Map<number, number[]>(); // Cache danh sách user theo department
    const subprocessHistoryData = [];
    const assignedUserIds: number[] = [];

    for (const subprocess of subprocesses) {
      let userId = null;

      if (subprocess.departmentId) {
        if (!departmentUserMap.has(subprocess.departmentId)) {
          // Lấy tất cả user trong department và cache lại
          const users = await prisma.user.findMany({
            where: {
              departmentId: subprocess.departmentId,
              isVerifiedAccount: true,
            },
            select: { id: true },
          });

          if (users.length === 0) {
            throw new BadRequestException(
              `Department ${subprocess.departmentId} không có user nào được verify. Không thể tạo procedure history.`,
            );
          }

          departmentUserMap.set(
            subprocess.departmentId,
            users.map((u) => u.id),
          );
        }

        // Random user từ danh sách đã cache
        const userIds = departmentUserMap.get(subprocess.departmentId);
        if (userIds && userIds.length > 0) {
          const randomIndex = Math.floor(Math.random() * userIds.length);
          userId = userIds[randomIndex];
        }
      } else {
        // Subprocess không có departmentId: Tìm user mặc định
        const defaultUser = await this.findDefaultUser(prisma);
        if (defaultUser) {
          userId = defaultUser.id;
        }
      }

      // Validate trước khi tạo - đảm bảo không bao giờ có userId = null
      if (!userId) {
        throw new BadRequestException(
          `Không thể tìm thấy user phù hợp cho subprocess: ${subprocess.name} (step: ${subprocess.step})`,
        );
      }

      subprocessHistoryData.push({
        name: subprocess.name,
        description: subprocess.description,
        estimatedNumberOfDays: subprocess.estimatedNumberOfDays,
        numberOfDaysBeforeDeadline: subprocess.numberOfDaysBeforeDeadline,
        roleOfThePersonInCharge: subprocess.roleOfThePersonInCharge,
        isRequired: subprocess.isRequired,
        isStepWithCost: subprocess.isStepWithCost,
        step: subprocess.step,
        departmentId: subprocess.departmentId ?? null,
        userId: userId, // Đảm bảo không bao giờ null
        procedureHistoryId,
      });

      assignedUserIds.push(userId);
    }

    const createdSubprocessHistories =
      await prisma.subprocessHistory.createMany({
        data: subprocessHistoryData,
      });

    // Sau khi tạo SubprocessHistory, tự động tạo FieldSubprocess với subprocessesHistoryId
    if (createdSubprocessHistories.count > 0) {
      await this.createFieldSubprocessForSubprocessHistories(
        prisma,
        subprocesses,
        procedureHistoryId,
      );
    }

    return assignedUserIds;
  }

  private async findDefaultUser(prisma: any) {
    // 1. Tìm user có role ADMIN hoặc SUPER_ADMIN
    const adminUser = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isVerifiedAccount: true,
      },
      select: { id: true },
    });

    if (adminUser) {
      return adminUser;
    }

    // 2. Tìm user đầu tiên được verify
    const verifiedUser = await prisma.user.findFirst({
      where: {
        isVerifiedAccount: true,
      },
      select: { id: true },
    });

    return verifiedUser;
  }

  private async createFieldSubprocessForSubprocessHistories(
    prisma: any,
    subprocesses: any[],
    procedureHistoryId: number,
  ) {
    for (const subprocess of subprocesses) {
      // Tìm FieldSubprocess hiện có với subprocessId
      const existingFieldSubprocess = await prisma.fieldSubprocess.findUnique({
        where: { subprocessId: subprocess.id },
      });

      if (existingFieldSubprocess) {
        // Tìm SubprocessHistory tương ứng với step này
        const subprocessHistory = await prisma.subprocessHistory.findFirst({
          where: {
            procedureHistoryId,
            step: subprocess.step,
          },
        });

        if (subprocessHistory) {
          // Cập nhật FieldSubprocess hiện có để gán subprocessesHistoryId
          await prisma.fieldSubprocess.update({
            where: { id: existingFieldSubprocess.id },
            data: {
              subprocessesHistoryId: subprocessHistory.id,
            },
          });
        }
      }
    }
  }

  private async linkProcedureHistoryToRequest(
    prisma: any,
    requestId: number,
    procedureHistoryId: number,
  ) {
    await prisma.request.update({
      where: { id: requestId },
      data: { procedureHistoryId },
    });
  }

  private async handleRequestApprovalInfo(
    prisma: any,
    requestId: number,
    dto: UpdateRequestStatusDto,
  ) {
    if (
      dto.status !== ('HOLD' as RequestStatus) &&
      dto.status !== ('REJECTED' as RequestStatus) &&
      dto.status !== ('APPROVED' as RequestStatus)
    ) {
      return;
    }

    const existingApprovalInfo = await prisma.requestApprovalInfo.findFirst({
      where: { requestId },
    });

    const approvalData: any = {
      requestId,
      files: dto.files?.filter((file) => file && file.trim() !== '') || [],
    };

    if (dto.status === ('HOLD' as RequestStatus)) {
      approvalData.holdReason = dto.holdReason;
      approvalData.denyReason = null;
      approvalData.productionPlan = null;
    } else if (dto.status === ('REJECTED' as RequestStatus)) {
      approvalData.denyReason = dto.denyReason;
      approvalData.holdReason = null;
      approvalData.productionPlan = null;
    } else if (dto.status === ('APPROVED' as RequestStatus)) {
      approvalData.productionPlan = dto.productionPlan;
      approvalData.holdReason = null;
      approvalData.denyReason = null;
    }

    if (existingApprovalInfo) {
      await prisma.requestApprovalInfo.update({
        where: { id: existingApprovalInfo.id },
        data: approvalData,
      });
    } else {
      await prisma.requestApprovalInfo.create({
        data: approvalData,
      });
    }
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

  async getRequestStatisticsByStatus() {
    const statuses = Object.values(RequestStatus);

    // Get total count of all requests
    const total = await this.prismaService.request.count();

    // Get count grouped by each status
    const counts = await this.prismaService.request.groupBy({
      by: ['status'],
      _count: true,
    });

    // Build output in the desired shape
    const statistics: Record<string, number> = {
      ALL: total,
    };

    statuses.forEach((status) => {
      const found = counts.find((c) => c.status === status);
      statistics[status] = found ? found._count : 0;
    });

    return { data: statistics };
  }

  async findByStatusProductIdWithHistory(statusProductId: number) {
    if (!statusProductId) {
      throw new BadRequestException('Không tìm thấy trạng thái sản phẩm');
    }
    const requests = await this.prismaService.request.findMany({
      where: { statusProductId },
      include: {
        procedureHistory: {
          include: {
            subprocessesHistory: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    userName: true,
                    email: true,
                    phoneNumber: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { step: 'asc' },
            },
          },
        },
      },
    });
    return { data: requests };
  }

  async addMaterial(requestId: number, dto: AddMaterialToRequestDto) {
    const request = await this.prismaService.request.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${requestId}`);
    }

    await this.validateMaterials([dto.materialId]);

    await this.prismaService.requestMaterial.upsert({
      where: {
        requestId_materialId: {
          requestId,
          materialId: dto.materialId,
        },
      },
      update: {
        quantity: dto.quantity,
      },
      create: {
        requestId,
        materialId: dto.materialId,
        quantity: dto.quantity,
      },
    });

    return this.findByIdInternal(requestId);
  }

  async removeMaterial(requestId: number, dto: RemoveMaterialFromRequestDto) {
    const request = await this.prismaService.request.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${requestId}`);
    }

    const requestMaterial = await this.prismaService.requestMaterial.findUnique(
      {
        where: { id: dto.materialRequestId },
      },
    );
    if (!requestMaterial || requestMaterial.requestId !== requestId) {
      throw new NotFoundException(
        `MaterialRequest với ID ${dto.materialRequestId} không tồn tại trong request này`,
      );
    }

    await this.prismaService.requestMaterial.delete({
      where: { id: dto.materialRequestId },
    });

    await this.prismaService.requestInput.deleteMany({
      where: { materialId: requestMaterial.materialId },
    });

    return this.findByIdInternal(requestId);
  }

  /**
   * Lấy ra một user ngẫu nhiên trong department theo departmentId (Internal version)
   * @param prisma - Prisma client instance
   * @param departmentId - ID của department
   * @returns User ngẫu nhiên trong department hoặc null nếu không có user nào
   */
  private async getRandomUserByDepartmentIdInternal(
    prisma: any,
    departmentId: number,
  ) {
    // Lấy tất cả users trong department
    const users = await prisma.user.findMany({
      where: {
        departmentId: departmentId,
        isVerifiedAccount: true,
      },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
        departmentId: true,
      },
    });

    if (users.length === 0) {
      return null;
    }

    // Chọn user ngẫu nhiên
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
  }

  async getRandomUserByDepartmentId(departmentId: number) {
    const department = await this.prismaService.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Không tìm thấy department với ID ${departmentId}`,
      );
    }

    const users = await this.prismaService.user.findMany({
      where: {
        departmentId: departmentId,
        isVerifiedAccount: true,
      },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
        departmentId: true,
      },
    });

    if (users.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * users.length);
    const randomUser = users[randomIndex];

    return {
      data: randomUser,
      totalUsers: users.length,
      department: {
        id: department.id,
        name: department.name,
        description: department.description,
      },
    };
  }

  async saveOutput(requestId: number, saveOutputDto: SaveOutputDto) {
    const request = await this.prismaService.request.findUnique({
      where: { id: requestId },
      include: {
        product: true,
        material: true,
        statusProduct: {
          include: {
            procedure: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${requestId}`);
    }

    if (request.productId || request.materialId) {
      throw new BadRequestException(
        'Yêu cầu này đã có output. Không thể thêm output mới.',
      );
    }

    const { outputType } = saveOutputDto;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        let outputData: any = {};

        switch (outputType) {
          case OutputType.PRODUCT:
            if (!saveOutputDto.productName || !saveOutputDto.categoryId) {
              throw new BadRequestException(
                'Tên sản phẩm và categoryId là bắt buộc khi outputType là PRODUCT',
              );
            }

            const category = await prisma.category.findUnique({
              where: { id: saveOutputDto.categoryId },
            });

            if (!category) {
              throw new NotFoundException(
                `Không tìm thấy category với ID ${saveOutputDto.categoryId}`,
              );
            }

            const newProduct = await prisma.product.create({
              data: {
                name: saveOutputDto.productName,
                description: saveOutputDto.productDescription || null,
                categoryId: saveOutputDto.categoryId,
              },
            });

            outputData.productId = newProduct.id;
            break;

          case OutputType.INGREDIENT:
          case OutputType.ACCESSORY:
            if (
              !saveOutputDto.materialName ||
              !saveOutputDto.materialCode ||
              !saveOutputDto.materialQuantity ||
              !saveOutputDto.materialUnit ||
              !saveOutputDto.originId
            ) {
              throw new BadRequestException(
                'Tên, mã, số lượng, đơn vị và originId là bắt buộc khi outputType là INGREDIENT hoặc ACCESSORY',
              );
            }

            const origin = await prisma.origin.findUnique({
              where: { id: saveOutputDto.originId },
            });

            if (!origin) {
              throw new NotFoundException(
                `Không tìm thấy origin với ID ${saveOutputDto.originId}`,
              );
            }

            const existingMaterial = await prisma.material.findUnique({
              where: { code: saveOutputDto.materialCode },
            });

            if (existingMaterial) {
              throw new BadRequestException(
                `Mã nguyên vật liệu ${saveOutputDto.materialCode} đã tồn tại`,
              );
            }

            const materialType =
              outputType === OutputType.INGREDIENT
                ? MaterialType.INGREDIENT
                : MaterialType.ACCESSORY;

            const newMaterial = await prisma.material.create({
              data: {
                name: saveOutputDto.materialName,
                code: saveOutputDto.materialCode,
                quantity: saveOutputDto.materialQuantity,
                unit: saveOutputDto.materialUnit,
                description: saveOutputDto.materialDescription || null,
                image: saveOutputDto.materialImages || [],
                type: materialType,
                originId: saveOutputDto.originId,
              },
            });

            outputData.materialId = newMaterial.id;
            break;

          default:
            throw new BadRequestException(
              `OutputType không hợp lệ: ${outputType}`,
            );
        }

        const updatedRequest = await prisma.request.update({
          where: { id: requestId },
          data: outputData,
          include: {
            product: {
              include: {
                category: true,
              },
            },
            material: {
              include: {
                origin: true,
              },
            },
          },
        });

        if (request.statusProduct?.procedure?.id) {
          await prisma.procedure.update({
            where: { id: request.statusProduct.procedure.id },
            data: { outputType },
          });
        }

        return {
          message: `Output ${outputType.toLowerCase()} đã được tạo thành công`,
          data: updatedRequest,
        };
      });
    } catch (error) {
      console.error('Lỗi khi tạo output:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin.',
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Dữ liệu tham chiếu không hợp lệ. Vui lòng kiểm tra lại các ID.',
        );
      }

      throw new BadRequestException(
        'Tạo output thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.',
      );
    }
  }
}
