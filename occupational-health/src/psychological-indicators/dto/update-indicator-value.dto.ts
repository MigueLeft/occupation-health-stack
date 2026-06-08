import { IsString, IsOptional, MaxLength, IsInt, Min, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateIndicatorValueDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres.' })
  name?: string;

  @IsOptional()
  @IsInt({ message: 'El orden de clasificación debe ser un número entero.' })
  @Min(0, { message: 'El orden de clasificación no puede ser negativo.' })
  sortOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  isActive?: boolean;
}
