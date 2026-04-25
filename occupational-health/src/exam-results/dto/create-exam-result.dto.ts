import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  IsUrl,
} from 'class-validator';
import { EXAM_RESULT_VALUES } from '../exam-results.schema';

export class CreateExamResultDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsUUID('4', { message: 'El ID del examen debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del examen del catálogo es obligatorio.' })
  examId: string;

  // Valor flexible: puede ser texto, número u objeto JSON
  @IsOptional()
  resultValue?: any;

  @IsOptional()
  @IsString({ message: 'La observación debe ser una cadena de texto.' })
  observation?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL del documento debe ser una URL válida.' })
  url?: string;

  @IsOptional()
  @IsIn(EXAM_RESULT_VALUES, {
    message: `El resultado del examen debe ser uno de: ${EXAM_RESULT_VALUES.join(', ')}.`,
  })
  result?: string;
}
