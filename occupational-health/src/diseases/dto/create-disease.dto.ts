import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateDiseaseDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la enfermedad es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsBoolean({
    message: 'El campo isChronic debe ser un valor booleano (true o false).',
  })
  @IsOptional()
  isChronic?: boolean;
}
