import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class BackupService {
  constructor(private readonly config: ConfigService) {}

  exportDatabase(): Readable {
    const dbUrl = this.config.getOrThrow<string>('DATABASE_URL');
    const pass = new PassThrough();
    const errors: string[] = [];

    // Custom format: pg_restore maneja la dependencia de FKs correctamente al restaurar
    const child = spawn('pg_dump', [
      '--format=custom',
      '--no-acl',
      '--no-owner',
      dbUrl,
    ]);

    child.stderr.on('data', (chunk: Buffer) => errors.push(chunk.toString()));
    child.stdout.pipe(pass);

    child.on('error', (err) =>
      pass.destroy(
        new InternalServerErrorException(
          `pg_dump no encontrado: ${err.message}`,
        ),
      ),
    );

    child.on('close', (code) => {
      if (code !== 0) {
        pass.destroy(
          new InternalServerErrorException(
            `Error al generar respaldo (código ${code}): ${errors.join('')}`,
          ),
        );
      }
    });

    return pass;
  }

  restoreDatabase(data: Buffer): Promise<void> {
    const dbUrl = this.config.getOrThrow<string>('DATABASE_URL');

    return new Promise<void>((resolve, reject) => {
      // pg_restore ordena correctamente los DROPs y CREATEs respetando FKs
      const child = spawn('pg_restore', [
        '--clean',
        '--if-exists',
        '--no-acl',
        '--no-owner',
        '--single-transaction',
        '-d',
        dbUrl,
      ]);

      const errors: string[] = [];
      child.stderr.on('data', (chunk: Buffer) => errors.push(chunk.toString()));

      child.on('error', (err) =>
        reject(
          new InternalServerErrorException(
            `pg_restore no encontrado: ${err.message}`,
          ),
        ),
      );

      child.on('close', (code) => {
        if (code !== 0) {
          reject(
            new InternalServerErrorException(
              `Error al restaurar respaldo: ${errors.join('')}`,
            ),
          );
        } else {
          resolve();
        }
      });

      child.stdin.write(data);
      child.stdin.end();
    });
  }
}
