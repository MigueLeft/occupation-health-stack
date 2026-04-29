import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { user as userTable } from './auth.schema';
import { roles } from '../roles/roles.schema';
import { PERMISSION_KEY } from './require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE) private readonly db: NodePgDatabase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<
      { module: string; action: string } | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!required) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ currentUser?: { id: string } }>();
    const currentUser = request.currentUser;
    if (!currentUser) return false;

    const [userRecord] = await this.db
      .select({ roleId: userTable.roleId })
      .from(userTable)
      .where(eq(userTable.id, currentUser.id));

    if (!userRecord?.roleId) {
      throw new ForbiddenException(
        `No tienes un rol asignado. Contacta al administrador para acceder a "${required.module}".`,
      );
    }

    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, userRecord.roleId));

    if (!role) {
      throw new ForbiddenException(`Tu rol no existe en el sistema.`);
    }

    const hasPermission =
      role.permissions?.[required.module]?.[required.action] === true;

    if (!hasPermission) {
      throw new ForbiddenException(
        `No tienes permiso para "${required.action}" en el módulo "${required.module}". Contacta al administrador.`,
      );
    }

    return true;
  }
}
