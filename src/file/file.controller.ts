import {
  Controller,
  Get,
  Res,
  Delete,
  Param,
  Post,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { FileService } from './file.service';
import { DeleteMultipleDto } from './dto/delete-multiple.dto';

function storageConfig() {
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  return diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  });
}

@ApiTags('Upload File')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @ApiOperation({ summary: 'Tải lên một tập tin' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig() }))
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Tải lên nhiều tập tin' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, { storage: storageConfig() }))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map((f) => ({
      filename: f.filename,
      originalname: f.originalname,
      size: f.size,
    }));
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Xem/ tải xuống tập tin' })
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.resolve(process.cwd(), 'uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Xóa tập tin' })
  deleteFile(@Param('filename') filename: string) {
    return this.fileService.deleteFile(filename);
  }

  @Post('delete-multiple')
  @ApiOperation({ summary: 'Xóa nhiều tập tin' })
  @ApiBody({ type: DeleteMultipleDto })
  deleteMultiple(@Body() dto: DeleteMultipleDto) {
    return this.fileService.deleteFiles(dto.filenames);
  }
}
