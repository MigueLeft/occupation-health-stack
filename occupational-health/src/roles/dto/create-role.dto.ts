import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import type { PermissionsMatrix } from '../roles.schema';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsObject()
  @IsOptional()
  permissions?: PermissionsMatrix;
}
