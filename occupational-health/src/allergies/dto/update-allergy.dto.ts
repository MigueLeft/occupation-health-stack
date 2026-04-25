import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdateAllergyDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la alergia no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name?: string;
}
