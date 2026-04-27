import { IsString, IsNotEmpty, MaxLength, IsArray, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePsychometricTestCatalogDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del test psicométrico es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsArray({ message: 'Las interpretaciones deben ser un arreglo de cadenas de texto.' })
  @ArrayNotEmpty({ message: 'El test debe tener al menos una interpretación/resultado posible.' })
  @IsString({ each: true, message: 'Cada interpretación debe ser una cadena de texto.' })
  interpretations: string[];
}
