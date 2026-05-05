import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { roles } from './roles.schema';
import { user } from '../auth/auth.schema';
import { SYSTEM_MODULES } from './constants';
import type { CreateRoleDto } from './dto/create-role.dto';
import type { UpdateRoleDto } from './dto/update-role.dto';
import type { UpdatePermissionsDto } from './dto/update-permissions.dto';

@Injectable()
export class RolesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(includeHidden = false) {
    const allRoles = await this.db.select().from(roles);

    const rolesWithCount = await Promise.all(
      allRoles.map(async (role) => {
        const [countResult] = await this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(user)
          .where(eq(user.roleId, role.id));

        return { ...role, userCount: countResult?.count ?? 0 };
      }),
    );

    return includeHidden
      ? rolesWithCount
      : rolesWithCount.filter((r) => r.isVisible);
  }

  async findOne(id: string) {
    const [role] = await this.db.select().from(roles).where(eq(roles.id, id));
    if (!role) throw new NotFoundException(`Rol con id ${id} no encontrado`);
    return role;
  }

  async getModules() {
    return SYSTEM_MODULES;
  }

  async create(dto: CreateRoleDto) {
    const [existing] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, dto.name));

    if (existing) throw new ConflictException(`El rol "${dto.name}" ya existe`);

    const [created] = await this.db
      .insert(roles)
      .values({
        name: dto.name,
        description: dto.description,
        isVisible: dto.isVisible ?? true,
        permissions: dto.permissions ?? {},
      })
      .returning();

    return { role: created };
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);

    const [updated] = await this.db
      .update(roles)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();

    return { role: updated };
  }

  async updatePermissions(id: string, dto: UpdatePermissionsDto) {
    await this.findOne(id);

    const [updated] = await this.db
      .update(roles)
      .set({ permissions: dto.permissions, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();

    return { role: updated };
  }

  async remove(id: string) {
    await this.findOne(id);

    const [linkedUser] = await this.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.roleId, id))
      .limit(1);

    if (linkedUser) {
      throw new ConflictException(
        'No se puede eliminar este rol porque tiene usuarios asignados. Reasigne los usuarios a otro rol primero.',
      );
    }

    await this.db.delete(roles).where(eq(roles.id, id));
    return { message: 'Rol eliminado correctamente' };
  }
}
