import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { user } from '../auth/auth.schema';
import { roles } from '../roles/roles.schema';
import { auth } from '../auth/auth';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll() {
    const users = await this.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        banned: user.banned,
        createdAt: user.createdAt,
        roleId: user.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(user)
      .leftJoin(roles, eq(user.roleId, roles.id));

    return { users };
  }

  async findOne(id: string) {
    const [found] = await this.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        banned: user.banned,
        createdAt: user.createdAt,
        roleId: user.roleId,
        roleName: roles.name,
      })
      .from(user)
      .leftJoin(roles, eq(user.roleId, roles.id))
      .where(eq(user.id, id));

    if (!found) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return { user: found };
  }

  async create(dto: CreateUserDto) {
    const fullName = `${dto.firstName} ${dto.lastName}`.trim();

    const response = await auth.api.signUpEmail({
      body: { name: fullName, email: dto.email, password: dto.password },
    });

    let createdUser: { id: string; email: string } | null = null;

    if (response instanceof Response) {
      if (!response.ok) {
        const err = (await response.json()) as { message?: string };
        throw new ConflictException(err.message ?? 'El correo ya está en uso');
      }
      const data = (await response.json()) as {
        user: { id: string; email: string };
      };
      createdUser = data.user;
    } else {
      // Versión que retorna datos directamente
      createdUser = (response as { user: { id: string; email: string } }).user;
    }

    if (!createdUser) {
      throw new InternalServerErrorException('Error al crear el usuario');
    }

    if (dto.roleId) {
      await this.db
        .update(user)
        .set({ roleId: dto.roleId })
        .where(eq(user.id, createdUser.id));
    }

    return this.findOne(createdUser.id);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    await this.db
      .update(user)
      .set({
        ...(dto.roleId !== undefined && { roleId: dto.roleId }),
        ...(dto.banned !== undefined && { banned: dto.banned }),
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(user).where(eq(user.id, id));
    return { message: 'Usuario eliminado correctamente' };
  }
}
