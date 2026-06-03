import {
  IsOptional,
  IsUUID,
  IsBoolean,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsOptional()
  email?: string;

  @IsUUID('4', { message: 'El ID del rol no es un UUID válido.' })
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  banned?: boolean;
}
