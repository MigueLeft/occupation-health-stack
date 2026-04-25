import { IsOptional, IsString, IsIn, IsUrl } from 'class-validator';
import { EXAM_RESULT_VALUES } from '../exam-results.schema';

export class UpdateExamResultDto {
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
