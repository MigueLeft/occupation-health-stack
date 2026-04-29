import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDiseaseCategoryDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({
    message: 'El nombre de la categoría de diagnóstico es obligatorio.',
  })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;
}
