import { IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  banned?: boolean;
}
