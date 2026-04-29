import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // GET endpoints are open to all authenticated users (needed for permission bootstrap)
  @Get()
  findAll(@Query('includeHidden') includeHidden?: string) {
    return this.rolesService.findAll(includeHidden === 'true');
  }

  @Get('modules')
  getModules() {
    return this.rolesService.getModules();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermission('roles', 'create')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('roles', 'edit')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Put(':id/permissions')
  @RequirePermission('roles', 'edit')
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.rolesService.updatePermissions(id, dto);
  }

  @Delete(':id')
  @RequirePermission('roles', 'delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
