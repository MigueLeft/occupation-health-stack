import { IsObject, IsNotEmpty } from 'class-validator';
import type { PermissionsMatrix } from '../roles.schema';

export class UpdatePermissionsDto {
  @IsObject()
  @IsNotEmpty()
  permissions: PermissionsMatrix;
}
