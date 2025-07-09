import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  async deleteFile(filename: string) {
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.access(filePath);
    } catch (err) {
      throw new NotFoundException('File not found');
    }

    await fs.unlink(filePath);
    return { message: 'File deleted successfully' };
  }

  async deleteFiles(filenames: string[]) {
    const results = await Promise.all(
      filenames.map(async (name) => {
        try {
          await this.deleteFile(name);
          return { filename: name, status: 'deleted' };
        } catch (err) {
          return { filename: name, status: 'not_found' };
        }
      }),
    );
    return { results };
  }
}
