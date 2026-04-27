import { IsString, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La dirección de la empresa es obligatoria.' })
  @MaxLength(500, { message: 'La dirección no puede exceder los 500 caracteres.' })
  address: string;

  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El RIF debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El RIF de la empresa es obligatorio.' })
  @MinLength(10, { message: 'El RIF debe tener al menos 10 caracteres.' })
  @MaxLength(50, { message: 'El RIF no puede exceder los 50 caracteres.' })
  rif: string;

  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El contacto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El contacto de la empresa es obligatorio.' })
  @Matches(/^\d{4}-?\d{7}$/, { message: 'El teléfono de contacto debe tener exactamente 11 dígitos.' })
  @MaxLength(255, { message: 'El contacto no puede exceder los 255 caracteres.' })
  contact: string;
}
