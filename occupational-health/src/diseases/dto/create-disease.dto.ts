import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDiseaseDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la enfermedad es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo isChronic debe ser verdadero o falso.' })
  isChronic?: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido.' })
  categoryId?: string;
}
