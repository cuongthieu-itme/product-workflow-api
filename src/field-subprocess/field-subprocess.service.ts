import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateFieldSubprocessDto } from './dto/create-field-subprocess.dto';
import { UpdateFieldSubprocessDto } from './dto/update-field-subprocess.dto';
import { FilterFieldSubprocessDto } from './dto/filter-field-subprocess.dto';
import { UpdateOrCreateCheckFieldDto } from './dto/update-or-create-check-field.dto';
import { CheckFieldOptionDto } from './dto/check-field-option.dto';

@Injectable()
export class FieldSubprocessService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterFieldSubprocessDto) {
    try {
      const where: any = {};

      if (filters?.subprocessId) where.subprocessId = filters.subprocessId;
      if (filters?.materialCode)
        where.materialCode = {
          contains: filters.materialCode,
          mode: 'insensitive',
        };
      if (filters?.materialName)
        where.materialName = {
          contains: filters.materialName,
          mode: 'insensitive',
        };
      if (filters?.requestId) where.requestId = filters.requestId;
      if (filters?.status)
        where.status = { contains: filters.status, mode: 'insensitive' };
      if (filters?.sampleStatus)
        where.sampleStatus = {
          contains: filters.sampleStatus,
          mode: 'insensitive',
        };
      if (filters?.productFeedbackStatus)
        where.productFeedbackStatus = {
          contains: filters.productFeedbackStatus,
          mode: 'insensitive',
        };
      if (filters?.checkField) where.checkField = { has: filters.checkField };

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;

      const [total, data] = await Promise.all([
        this.prismaService.fieldSubprocess.count({ where }),
        this.prismaService.fieldSubprocess.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { id: 'desc' },
          include: {
            subprocess: {
              include: {
                procedure: true,
                department: true,
              },
            },
          },
        }),
      ]);

      return { data, page, limit, total };
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy danh sách các trường tiến trình: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
        include: {
          subprocess: {
            include: {
              procedure: true,
              department: true,
            },
          },
        },
      });

      if (!data) {
        throw new NotFoundException(
          `Không tìm thấy các trường tiến trình với ID ${id}`,
        );
      }

      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Lỗi khi tìm các trường tiến trình: ${error.message}`);
    }
  }

  async create(dto: CreateFieldSubprocessDto) {
    try {
      const transformedData = this.transformDtoData(dto);

      const newFieldSubprocess =
        await this.prismaService.fieldSubprocess.create({
          data: transformedData,
          include: {
            subprocess: {
              include: {
                procedure: true,
                department: true,
              },
            },
          },
        });

      return {
        message: 'Tạo các trường tiến trình thành công',
        data: newFieldSubprocess,
      };
    } catch (error) {
      throw new Error(`Lỗi khi tạo các trường tiến trình: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateFieldSubprocessDto) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Không tìm thấy các trường tiến trình với ID ${id}`,
        );
      }

      const transformedData = this.transformDtoData(dto);

      const updatedFieldSubprocess =
        await this.prismaService.fieldSubprocess.update({
          where: { id },
          data: transformedData,
          include: {
            subprocess: {
              include: {
                procedure: true,
                department: true,
              },
            },
          },
        });

      return {
        message: 'Cập nhật các trường tiến trình thành công',
        data: updatedFieldSubprocess,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(
        `Lỗi khi cập nhật các trường tiến trình: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Không tìm thấy các trường tiến trình với ID ${id}`,
        );
      }

      await this.prismaService.fieldSubprocess.delete({ where: { id } });

      return { message: 'Xóa các trường tiến trình thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Lỗi khi xóa các trường tiến trình: ${error.message}`);
    }
  }

  async findBySubprocessId(subprocessId: number) {
    try {
      const data = await this.prismaService.fieldSubprocess.findMany({
        where: { subprocessId },
        include: {
          subprocess: {
            include: {
              procedure: true,
              department: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      return { data };
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy trường tiến trình theo subprocess: ${error.message}`,
      );
    }
  }

  async getCheckFieldOptions(): Promise<{ data: CheckFieldOptionDto[] }> {
    try {
      const checkFieldMapping: Record<
        string,
        { label: string; type: string; field: string }
      > = {
        MATERIAL_CODE: {
          label: 'Mã vật liệu',
          type: 'input',
          field: 'materialCode',
        },
        MATERIAL_NAME: {
          label: 'Tên vật liệu',
          type: 'input',
          field: 'materialName',
        },
        REQUEST_ID: { label: 'ID yêu cầu', type: 'input', field: 'requestId' },
        REQUEST_DATE: {
          label: 'Ngày yêu cầu',
          type: 'date',
          field: 'requestDate',
        },
        PRIORITY: { label: 'Độ ưu tiên', type: 'select', field: 'priority' },
        CREATED_BY: { label: 'Người tạo', type: 'input', field: 'createdBy' },
        REQUEST_SOURCE: {
          label: 'Nguồn yêu cầu',
          type: 'select',
          field: 'requestSource',
        },
        CHECKER: { label: 'Người kiểm tra', type: 'input', field: 'checker' },
        DESCRIPTION_MATERIAL: {
          label: 'Mô tả vật liệu',
          type: 'textarea',
          field: 'descriptionMaterial',
        },
        STATUS: { label: 'Trạng thái', type: 'select', field: 'status' },
        QUANTITY: { label: 'Số lượng', type: 'number', field: 'quantity' },
        UNIT: { label: 'Đơn vị', type: 'input', field: 'unit' },
        COLOR: { label: 'Màu sắc', type: 'input', field: 'color' },
        MATERIAL_TYPE: {
          label: 'Loại vật liệu',
          type: 'select',
          field: 'materialType',
        },
        MEDIA: { label: 'Tệp đa phương tiện', type: 'file', field: 'media' },
        PURCHASE_LINK: {
          label: 'Liên kết mua hàng',
          type: 'input',
          field: 'purchaseLink',
        },
        ADDITIONAL_NOTE: {
          label: 'Ghi chú bổ sung',
          type: 'textarea',
          field: 'additionalNote',
        },
        APPROVED_BY: {
          label: 'Người phê duyệt',
          type: 'input',
          field: 'approvedBy',
        },
        APPROVED_TIME: {
          label: 'Thời gian phê duyệt',
          type: 'date',
          field: 'approvedTime',
        },
        PURCHASER: { label: 'Người mua', type: 'input', field: 'purchaser' },
        PURCHASING_TIME: {
          label: 'Thời gian mua',
          type: 'date',
          field: 'purchasingTime',
        },
        TRACKING_LINK: {
          label: 'Liên kết theo dõi',
          type: 'input',
          field: 'trackingLink',
        },
        RECEIVED_QUANTITY: {
          label: 'Số lượng đã nhận',
          type: 'number',
          field: 'receivedQuantity',
        },
        CHECKED_BY: {
          label: 'Người kiểm tra',
          type: 'input',
          field: 'checkedBy',
        },
        CHECKED_TIME: {
          label: 'Thời gian kiểm tra',
          type: 'date',
          field: 'checkedTime',
        },
        SAMPLE_PRODUCTION_PLAN: {
          label: 'Kế hoạch sản xuất mẫu',
          type: 'textarea',
          field: 'sampleProductionPlan',
        },
        DESIGNER: { label: 'Nhà thiết kế', type: 'input', field: 'designer' },
        START_TIME: {
          label: 'Thời gian bắt đầu',
          type: 'date',
          field: 'startTime',
        },
        COMPLETED_TIME: {
          label: 'Thời gian hoàn thành',
          type: 'date',
          field: 'completedTime',
        },
        PRODUCTION_FILE_LINK: {
          label: 'Liên kết tệp sản xuất',
          type: 'input',
          field: 'productionFileLink',
        },
        SAMPLE_MAKER: {
          label: 'Người làm mẫu',
          type: 'input',
          field: 'sampleMaker',
        },
        SAMPLE_STATUS: {
          label: 'Trạng thái mẫu',
          type: 'select',
          field: 'sampleStatus',
        },
        SAMPLE_MEDIA_LINK: {
          label: 'Liên kết đa phương tiện mẫu',
          type: 'file',
          field: 'sampleMediaLink',
        },
        NOTE: { label: 'Ghi chú', type: 'textarea', field: 'note' },
        FINAL_APPROVED_SAMPLE_IMAGE: {
          label: 'Hình ảnh mẫu được phê duyệt cuối cùng',
          type: 'file',
          field: 'finalApprovedSampleImage',
        },
        FINAL_PRODUCT_VIDEO: {
          label: 'Video sản phẩm cuối cùng',
          type: 'file',
          field: 'finalProductVideo',
        },
        PRODUCT_MANUFACTURING_PLAN: {
          label: 'Kế hoạch sản xuất sản phẩm',
          type: 'textarea',
          field: 'productManufacturingPlan',
        },
        PRODUCT_FEEDBACK_RESPONDER: {
          label: 'Người phản hồi phản hồi sản phẩm',
          type: 'input',
          field: 'productFeedbackResponder',
        },
        DEADLINE_CHECKING: {
          label: 'Hạn chót kiểm tra',
          type: 'date',
          field: 'deadlineChecking',
        },
        PRODUCT_FEEDBACK_STATUS: {
          label: 'Trạng thái phản hồi sản phẩm',
          type: 'select',
          field: 'productFeedbackStatus',
        },
        REASON_FOR_NON_PRODUCTION: {
          label: 'Lý do không sản xuất',
          type: 'textarea',
          field: 'reasonForNonProduction',
        },
        SAMPLE_FEEDBACK_RESPONDER: {
          label: 'Người phản hồi phản hồi mẫu',
          type: 'input',
          field: 'sampleFeedbackResponder',
        },
        DEMO_PRICE: { label: 'Giá demo', type: 'number', field: 'demoPrice' },
        SAMPLE_FEEDBACK: {
          label: 'Phản hồi mẫu',
          type: 'textarea',
          field: 'sampleFeedback',
        },
        // Step 6 fields
        MOQInput: {
          label: 'MOQ Input',
          type: 'number',
          field: 'MOQInput',
        },
        sizeDimension: {
          label: 'Kích thước',
          type: 'input',
          field: 'sizeDimension',
        },
        materialConfirmer: {
          label: 'Người xác nhận vật liệu',
          type: 'input',
          field: 'materialConfirmer',
        },
        purchaseStatus: {
          label: 'Trạng thái mua hàng',
          type: 'select',
          field: 'purchaseStatus',
        },
        confirmedQuantity: {
          label: 'Số lượng đã xác nhận',
          type: 'input',
          field: 'confirmedQuantity',
        },
        // Step 7 fields
        orderPlaced: {
          label: 'Đơn hàng đã đặt',
          type: 'input',
          field: 'orderPlaced',
        },
        orderDate: {
          label: 'Ngày đặt hàng',
          type: 'date',
          field: 'orderDate',
        },
        estimatedArrivalDate: {
          label: 'Ngày dự kiến đến',
          type: 'date',
          field: 'estimatedArrivalDate',
        },
        actualArrivalDate: {
          label: 'Ngày thực tế đến',
          type: 'date',
          field: 'actualArrivalDate',
        },
        warehouseChecker: {
          label: 'Người kiểm tra kho',
          type: 'input',
          field: 'warehouseChecker',
        },
        quantityReceived: {
          label: 'Số lượng đã nhận',
          type: 'number',
          field: 'quantityReceived',
        },
        checkedDate: {
          label: 'Ngày kiểm tra',
          type: 'date',
          field: 'checkedDate',
        },
        materialSentToRD: {
          label: 'Vật liệu gửi đến RD',
          type: 'input',
          field: 'materialSentToRD',
        },
        sentDateToRD: {
          label: 'Ngày gửi đến RD',
          type: 'date',
          field: 'sentDateToRD',
        },
        receivedDateByRD: {
          label: 'Ngày nhận bởi RD',
          type: 'date',
          field: 'receivedDateByRD',
        },
        RDMaterialChecker: {
          label: 'Người kiểm tra vật liệu RD',
          type: 'input',
          field: 'RDMaterialChecker',
        },
        sampleQualityFeedback: {
          label: 'Phản hồi chất lượng mẫu',
          type: 'textarea',
          field: 'sampleQualityFeedback',
        },
        feedbackDate: {
          label: 'Ngày phản hồi',
          type: 'date',
          field: 'feedbackDate',
        },
        // Step 8 fields
        startedTime: {
          label: 'Thời gian bắt đầu',
          type: 'date',
          field: 'startedTime',
        },
        assignedTo: {
          label: 'Giao cho',
          type: 'input',
          field: 'assignedTo',
        },
        linkTemplateMockup: {
          label: 'Liên kết template mockup',
          type: 'input',
          field: 'linkTemplateMockup',
        },
        templateChecker: {
          label: 'Người kiểm tra template',
          type: 'input',
          field: 'templateChecker',
        },
        templateCheckingStatus: {
          label: 'Trạng thái kiểm tra template',
          type: 'select',
          field: 'templateCheckingStatus',
        },
        mockupChecker: {
          label: 'Người kiểm tra mockup',
          type: 'input',
          field: 'mockupChecker',
        },
        mockupCheckingStatus: {
          label: 'Trạng thái kiểm tra mockup',
          type: 'select',
          field: 'mockupCheckingStatus',
        },
        // Step 9 fields
        priceCalculator: {
          label: 'Máy tính giá',
          type: 'number',
          field: 'priceCalculator',
        },
        priceList: {
          label: 'Danh sách giá',
          type: 'input',
          field: 'priceList',
        },
        productDescription: {
          label: 'Mô tả sản phẩm',
          type: 'textarea',
          field: 'productDescription',
        },
        variant: {
          label: 'Biến thể',
          type: 'input',
          field: 'variant',
        },
        // Step 10 fields
        estimatedUploadDate: {
          label: 'Ngày dự kiến upload',
          type: 'date',
          field: 'estimatedUploadDate',
        },
        actualUploadTime: {
          label: 'Thời gian upload thực tế',
          type: 'date',
          field: 'actualUploadTime',
        },
        productCode: {
          label: 'Mã sản phẩm',
          type: 'input',
          field: 'productCode',
        },
        productPageLink: {
          label: 'Liên kết trang sản phẩm',
          type: 'input',
          field: 'productPageLink',
        },
        SKU: {
          label: 'SKU',
          type: 'input',
          field: 'SKU',
        },
        SKUDescription: {
          label: 'Mô tả SKU',
          type: 'textarea',
          field: 'SKUDescription',
        },
        // Step 11 fields
        productName: {
          label: 'Tên sản phẩm',
          type: 'input',
          field: 'productName',
        },
        category: {
          label: 'Danh mục',
          type: 'select',
          field: 'category',
        },
        howToProduce: {
          label: 'Cách sản xuất',
          type: 'textarea',
          field: 'howToProduce',
        },
        materialNeedToUse: {
          label: 'Vật liệu cần sử dụng',
          type: 'textarea',
          field: 'materialNeedToUse',
        },
        // Step 12 fields
        groupAnnouncementAllDepartments: {
          label: 'Thông báo nhóm tất cả phòng ban',
          type: 'textarea',
          field: 'groupAnnouncementAllDepartments',
        },
        announcementOfRndWorkshopGroup: {
          label: 'Thông báo nhóm workshop R&D',
          type: 'textarea',
          field: 'announcementOfRndWorkshopGroup',
        },
      };

      const checkFieldOptions: CheckFieldOptionDto[] = Object.entries(
        checkFieldMapping,
      ).map(([enumValue, { label, type, field }]) => ({
        label,
        value: field,
        enumValue,
        type: type as
          | 'input'
          | 'select'
          | 'textarea'
          | 'date'
          | 'number'
          | 'checkbox'
          | 'radio'
          | 'file',
      }));

      return { data: checkFieldOptions };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách CheckFields: ${error.message}`);
    }
  }

  async updateOrCreateCheckField(dto: UpdateOrCreateCheckFieldDto) {
    try {
      const subprocess = await this.prismaService.subprocess.findUnique({
        where: { id: dto.subprocessId },
      });

      if (!subprocess) {
        throw new NotFoundException(
          `Không tìm thấy subprocess với ID ${dto.subprocessId}`,
        );
      }

      const existingFieldSubprocess =
        await this.prismaService.fieldSubprocess.findFirst({
          where: { subprocessId: dto.subprocessId },
        });

      let result;

      if (existingFieldSubprocess) {
        result = await this.prismaService.fieldSubprocess.update({
          where: { id: existingFieldSubprocess.id },
          data: {
            checkFields: dto.checkFields,
          },
          include: {
            subprocess: {
              include: {
                procedure: true,
                department: true,
              },
            },
          },
        });

        return {
          message: 'Cập nhật checkFields thành công',
          data: result,
          action: 'updated',
        };
      } else {
        result = await this.prismaService.fieldSubprocess.create({
          data: {
            subprocessId: dto.subprocessId,
            checkFields: dto.checkFields,
          },
          include: {
            subprocess: {
              include: {
                procedure: true,
                department: true,
              },
            },
          },
        });

        return {
          message: 'Tạo mới checkFields thành công',
          data: result,
          action: 'created',
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(
        `Lỗi khi cập nhật hoặc tạo mới checkFields: ${error.message}`,
      );
    }
  }

  async bulkCreate(dtos: CreateFieldSubprocessDto[]) {
    try {
      const transformedData = dtos.map((dto) => this.transformDtoData(dto));

      const createdFieldSubprocesses =
        await this.prismaService.fieldSubprocess.createMany({
          data: transformedData,
        });

      return {
        message: `Tạo thành công ${createdFieldSubprocesses.count} trường tiến trình`,
        count: createdFieldSubprocesses.count,
      };
    } catch (error) {
      throw new Error(
        `Lỗi khi tạo hàng loạt các trường tiến trình: ${error.message}`,
      );
    }
  }

  async bulkUpdate(ids: number[], dto: UpdateFieldSubprocessDto) {
    try {
      const transformedData = this.transformDtoData(dto);

      const result = await this.prismaService.fieldSubprocess.updateMany({
        where: { id: { in: ids } },
        data: transformedData,
      });

      return {
        message: `Cập nhật thành công ${result.count} trường tiến trình`,
        count: result.count,
      };
    } catch (error) {
      throw new Error(
        `Lỗi khi cập nhật hàng loạt các trường tiến trình: ${error.message}`,
      );
    }
  }

  async bulkRemove(ids: number[]) {
    try {
      const result = await this.prismaService.fieldSubprocess.deleteMany({
        where: { id: { in: ids } },
      });

      return {
        message: `Xóa thành công ${result.count} trường tiến trình`,
        count: result.count,
      };
    } catch (error) {
      throw new Error(
        `Lỗi khi xóa hàng loạt các trường tiến trình: ${error.message}`,
      );
    }
  }

  async getStatistics() {
    try {
      const [
        totalCount,
        bySubprocessCount,
        byStatusCount,
        bySampleStatusCount,
        byPurchaseStatusCount,
        byCategoryCount,
      ] = await Promise.all([
        this.prismaService.fieldSubprocess.count(),
        this.prismaService.fieldSubprocess.groupBy({
          by: ['subprocessId'],
          _count: { id: true },
        }),
        this.prismaService.fieldSubprocess.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prismaService.fieldSubprocess.groupBy({
          by: ['sampleStatus'],
          _count: { id: true },
        }),
        this.prismaService.fieldSubprocess.groupBy({
          by: ['purchaseStatus'],
          _count: { id: true },
        }),
        this.prismaService.fieldSubprocess.groupBy({
          by: ['category'],
          _count: { id: true },
        }),
      ]);

      return {
        totalCount,
        bySubprocess: bySubprocessCount,
        byStatus: byStatusCount,
        bySampleStatus: bySampleStatusCount,
        byPurchaseStatus: byPurchaseStatusCount,
        byCategory: byCategoryCount,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê: ${error.message}`);
    }
  }

  private transformDtoData(
    dto: CreateFieldSubprocessDto | UpdateFieldSubprocessDto,
  ) {
    const data: any = {};

    // Basic fields
    if (dto.subprocessId !== undefined) data.subprocessId = dto.subprocessId;

    // Step 1 fields
    if (dto.materialCode !== undefined) data.materialCode = dto.materialCode;
    if (dto.materialName !== undefined) data.materialName = dto.materialName;
    if (dto.requestId !== undefined) data.requestId = dto.requestId;
    if (dto.requestDate !== undefined)
      data.requestDate = new Date(dto.requestDate);
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.createdBy !== undefined) data.createdBy = dto.createdBy;
    if (dto.requestSource !== undefined) data.requestSource = dto.requestSource;
    if (dto.checker !== undefined) data.checker = dto.checker;
    if (dto.descriptionMaterial !== undefined)
      data.descriptionMaterial = dto.descriptionMaterial;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.materialType !== undefined) data.materialType = dto.materialType;
    if (dto.media !== undefined) data.media = dto.media;
    if (dto.purchaseLink !== undefined) data.purchaseLink = dto.purchaseLink;
    if (dto.additionalNote !== undefined)
      data.additionalNote = dto.additionalNote;
    if (dto.approvedBy !== undefined) data.approvedBy = dto.approvedBy;
    if (dto.approvedTime !== undefined)
      data.approvedTime = new Date(dto.approvedTime);
    if (dto.purchaser !== undefined) data.purchaser = dto.purchaser;
    if (dto.purchasingTime !== undefined)
      data.purchasingTime = new Date(dto.purchasingTime);
    if (dto.trackingLink !== undefined) data.trackingLink = dto.trackingLink;
    if (dto.receivedQuantity !== undefined)
      data.receivedQuantity = dto.receivedQuantity;
    if (dto.checkedBy !== undefined) data.checkedBy = dto.checkedBy;
    if (dto.checkedTime !== undefined)
      data.checkedTime = new Date(dto.checkedTime);

    // Step 2 fields
    if (dto.sampleProductionPlan !== undefined)
      data.sampleProductionPlan = dto.sampleProductionPlan;
    if (dto.designer !== undefined) data.designer = dto.designer;
    if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime);
    if (dto.completedTime !== undefined)
      data.completedTime = new Date(dto.completedTime);
    if (dto.productionFileLink !== undefined)
      data.productionFileLink = dto.productionFileLink;

    // Step 3 fields
    if (dto.sampleMaker !== undefined) data.sampleMaker = dto.sampleMaker;
    if (dto.sampleStatus !== undefined) data.sampleStatus = dto.sampleStatus;
    if (dto.sampleMediaLink !== undefined)
      data.sampleMediaLink = dto.sampleMediaLink;
    if (dto.note !== undefined) data.note = dto.note;
    if (dto.finalApprovedSampleImage !== undefined)
      data.finalApprovedSampleImage = dto.finalApprovedSampleImage;
    if (dto.finalProductVideo !== undefined)
      data.finalProductVideo = dto.finalProductVideo;

    // Step 4 fields
    if (dto.productManufacturingPlan !== undefined)
      data.productManufacturingPlan = dto.productManufacturingPlan;
    if (dto.productFeedbackResponder !== undefined)
      data.productFeedbackResponder = dto.productFeedbackResponder;
    if (dto.deadlineChecking !== undefined)
      data.deadlineChecking = new Date(dto.deadlineChecking);
    if (dto.productFeedbackStatus !== undefined)
      data.productFeedbackStatus = dto.productFeedbackStatus;
    if (dto.reasonForNonProduction !== undefined)
      data.reasonForNonProduction = dto.reasonForNonProduction;

    // Step 5 fields
    if (dto.sampleFeedbackResponder !== undefined)
      data.sampleFeedbackResponder = dto.sampleFeedbackResponder;
    if (dto.demoPrice !== undefined) data.demoPrice = dto.demoPrice;
    if (dto.sampleFeedback !== undefined)
      data.sampleFeedback = dto.sampleFeedback;

    // Step 6 fields
    if (dto.MOQInput !== undefined) data.MOQInput = dto.MOQInput;
    if (dto.sizeDimension !== undefined) data.sizeDimension = dto.sizeDimension;
    if (dto.materialConfirmer !== undefined)
      data.materialConfirmer = dto.materialConfirmer;
    if (dto.purchaseStatus !== undefined)
      data.purchaseStatus = dto.purchaseStatus;
    if (dto.confirmedQuantity !== undefined)
      data.confirmedQuantity = dto.confirmedQuantity;

    // Step 7 fields
    if (dto.orderPlaced !== undefined) data.orderPlaced = dto.orderPlaced;
    if (dto.orderDate !== undefined) data.orderDate = new Date(dto.orderDate);
    if (dto.estimatedArrivalDate !== undefined)
      data.estimatedArrivalDate = new Date(dto.estimatedArrivalDate);
    if (dto.actualArrivalDate !== undefined)
      data.actualArrivalDate = new Date(dto.actualArrivalDate);
    if (dto.warehouseChecker !== undefined)
      data.warehouseChecker = dto.warehouseChecker;
    if (dto.quantityReceived !== undefined)
      data.quantityReceived = dto.quantityReceived;
    if (dto.checkedDate !== undefined)
      data.checkedDate = new Date(dto.checkedDate);
    if (dto.materialSentToRD !== undefined)
      data.materialSentToRD = dto.materialSentToRD;
    if (dto.sentDateToRD !== undefined)
      data.sentDateToRD = new Date(dto.sentDateToRD);
    if (dto.receivedDateByRD !== undefined)
      data.receivedDateByRD = new Date(dto.receivedDateByRD);
    if (dto.RDMaterialChecker !== undefined)
      data.RDMaterialChecker = dto.RDMaterialChecker;
    if (dto.sampleQualityFeedback !== undefined)
      data.sampleQualityFeedback = dto.sampleQualityFeedback;
    if (dto.feedbackDate !== undefined)
      data.feedbackDate = new Date(dto.feedbackDate);

    // Step 8 fields
    if (dto.startedTime !== undefined)
      data.startedTime = new Date(dto.startedTime);
    if (dto.assignedTo !== undefined) data.assignedTo = dto.assignedTo;
    if (dto.linkTemplateMockup !== undefined)
      data.linkTemplateMockup = dto.linkTemplateMockup;
    if (dto.templateChecker !== undefined)
      data.templateChecker = dto.templateChecker;
    if (dto.templateCheckingStatus !== undefined)
      data.templateCheckingStatus = dto.templateCheckingStatus;
    if (dto.mockupChecker !== undefined) data.mockupChecker = dto.mockupChecker;
    if (dto.mockupCheckingStatus !== undefined)
      data.mockupCheckingStatus = dto.mockupCheckingStatus;

    // Step 9 fields
    if (dto.priceCalculator !== undefined)
      data.priceCalculator = dto.priceCalculator;
    if (dto.priceList !== undefined) data.priceList = dto.priceList;
    if (dto.productDescription !== undefined)
      data.productDescription = dto.productDescription;
    if (dto.variant !== undefined) data.variant = dto.variant;

    // Step 10 fields
    if (dto.estimatedUploadDate !== undefined)
      data.estimatedUploadDate = new Date(dto.estimatedUploadDate);
    if (dto.actualUploadTime !== undefined)
      data.actualUploadTime = new Date(dto.actualUploadTime);
    if (dto.productCode !== undefined) data.productCode = dto.productCode;
    if (dto.productPageLink !== undefined)
      data.productPageLink = dto.productPageLink;
    if (dto.SKU !== undefined) data.SKU = dto.SKU;
    if (dto.SKUDescription !== undefined)
      data.SKUDescription = dto.SKUDescription;

    // Step 11 fields
    if (dto.productName !== undefined) data.productName = dto.productName;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.howToProduce !== undefined) data.howToProduce = dto.howToProduce;
    if (dto.materialNeedToUse !== undefined)
      data.materialNeedToUse = dto.materialNeedToUse;

    // Step 12 fields
    if (dto.groupAnnouncementAllDepartments !== undefined)
      data.groupAnnouncementAllDepartments =
        dto.groupAnnouncementAllDepartments;
    if (dto.announcementOfRndWorkshopGroup !== undefined)
      data.announcementOfRndWorkshopGroup = dto.announcementOfRndWorkshopGroup;

    // CheckFields array
    if (dto.checkFields !== undefined) data.checkFields = dto.checkFields;

    return data;
  }
}
