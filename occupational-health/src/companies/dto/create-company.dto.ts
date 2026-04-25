import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La dirección de la empresa es obligatoria.' })
  @MaxLength(500, {
    message: 'La dirección no puede exceder los 500 caracteres.',
  })
  address: string;

  @IsString({ message: 'El RIF debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El RIF de la empresa es obligatorio.' })
  @MaxLength(50, { message: 'El RIF no puede exceder los 50 caracteres.' })
  rif: string;

  @IsString({ message: 'El contacto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El contacto de la empresa es obligatorio.' })
  @MaxLength(255, {
    message: 'El contacto no puede exceder los 255 caracteres.',
  })
  contact: string;
}
