import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IsString, IsEmail, MinLength } from 'class-validator';
import { eq, and, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { user as userTable, verification as verificationTable } from '../auth/auth.schema';
import { auth } from '../auth/auth';

export class ResetPasswordMasterDto {
  @IsEmail({}, { message: 'Correo electrónico inválido.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres.' })
  newPassword: string;

  @IsString()
  masterKey: string;
}

@Controller('auth-utils')
export class AuthUtilsController {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  @Post('reset-password')
  async resetPasswordWithMasterKey(@Body() dto: ResetPasswordMasterDto) {
    const MASTER_KEY = process.env.MASTER_RESET_KEY ?? 'fcmpecapmil2026';

    if (dto.masterKey !== MASTER_KEY) {
      throw new UnauthorizedException('Clave maestra incorrecta.');
    }

    const [foundUser] = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, dto.email));

    if (!foundUser) {
      throw new NotFoundException(
        'No se encontró ningún usuario con ese correo electrónico.',
      );
    }

    const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

    // Genera token de restablecimiento vía better-auth
    await auth.handler(
      new Request(`${baseURL}/api/auth/forget-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: dto.email, redirectTo: baseURL }),
      }),
    );

    // Lee el token más reciente de la tabla de verificaciones
    const [verification] = await this.db
      .select()
      .from(verificationTable)
      .orderBy(desc(verificationTable.createdAt))
      .limit(1);

    if (!verification) {
      throw new BadRequestException(
        'No se pudo generar el token de restablecimiento. Intente de nuevo.',
      );
    }

    // Aplica el nuevo password con el token generado
    const resetResponse = await auth.handler(
      new Request(`${baseURL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verification.value,
          newPassword: dto.newPassword,
        }),
      }),
    );

    if (!resetResponse.ok) {
      throw new BadRequestException('No se pudo restablecer la contraseña.');
    }

    return { message: 'Contraseña restablecida correctamente.' };
  }
}
