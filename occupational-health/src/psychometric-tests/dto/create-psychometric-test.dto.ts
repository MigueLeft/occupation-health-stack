import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreatePsychometricTestDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsUUID('4', {
    message: 'El ID del test en el catálogo debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El ID del test en el catálogo es obligatorio.' })
  catalogTestId: string;

  @IsString({
    message: 'La interpretación seleccionada debe ser una cadena de texto.',
  })
  @IsOptional()
  @MaxLength(255, {
    message: 'La interpretación no puede exceder los 255 caracteres.',
  })
  selectedInterpretation?: string;

  @IsString({ message: 'Las observaciones deben ser una cadena de texto.' })
  @IsOptional()
  observations?: string;
}
