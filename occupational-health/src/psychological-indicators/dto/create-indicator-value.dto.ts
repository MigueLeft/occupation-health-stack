import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIndicatorValueDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del valor es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres.' })
  name: string;

  @IsOptional()
  @IsInt({ message: 'El orden de clasificación debe ser un número entero.' })
  @Min(0, { message: 'El orden de clasificación no puede ser negativo.' })
  sortOrder?: number;
}
