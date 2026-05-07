import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUUID,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
  @Matches(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
  password: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;
}
