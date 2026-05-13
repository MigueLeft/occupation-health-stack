import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  constructor(private readonly config: ConfigService) {}

  async exportDatabase(): Promise<Buffer> {
    const dbUrl = this.config.getOrThrow<string>('DATABASE_URL');
    try {
      const { stdout } = await execAsync(
        `pg_dump --clean --if-exists "${dbUrl}"`,
        { maxBuffer: 200 * 1024 * 1024 },
      );
      return Buffer.from(stdout, 'utf-8');
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Error al generar respaldo: ${err.stderr ?? err.message}`,
      );
    }
  }

  async restoreDatabase(sql: Buffer): Promise<void> {
    const dbUrl = this.config.getOrThrow<string>('DATABASE_URL');
    const tmpFile = join(tmpdir(), `restore-${randomUUID()}.sql`);
    try {
      await writeFile(tmpFile, sql);
      await execAsync(
        `psql --single-transaction "${dbUrl}" -f "${tmpFile}"`,
        { maxBuffer: 10 * 1024 * 1024 },
      );
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Error al restaurar respaldo: ${err.stderr ?? err.message}`,
      );
    } finally {
      await unlink(tmpFile).catch(() => null);
    }
  }
}
