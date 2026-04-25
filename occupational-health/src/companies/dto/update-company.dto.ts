import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía.' })
  @MaxLength(500, {
    message: 'La dirección no puede exceder los 500 caracteres.',
  })
  address?: string;

  @IsOptional()
  @IsString({ message: 'El RIF debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El RIF no puede estar vacío.' })
  @MaxLength(50, { message: 'El RIF no puede exceder los 50 caracteres.' })
  rif?: string;

  @IsOptional()
  @IsString({ message: 'El contacto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El contacto no puede estar vacío.' })
  @MaxLength(255, {
    message: 'El contacto no puede exceder los 255 caracteres.',
  })
  contact?: string;
}
