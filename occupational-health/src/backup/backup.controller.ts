import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { BackupService } from './backup.service';
import { RequirePermission } from '../auth/require-permission.decorator';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  @RequirePermission('backup', 'view')
  async exportDatabase(@Res() res: Response) {
    const buffer = await this.backupService.exportDatabase();
    const filename = `backup-${new Date().toISOString().slice(0, 10)}.sql`;
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('restore')
  @RequirePermission('backup', 'create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async restoreDatabase(@UploadedFile() file: MulterFile) {
    if (!file?.buffer) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    await this.backupService.restoreDatabase(file.buffer);
    return { message: 'Base de datos restaurada exitosamente' };
  }
}
