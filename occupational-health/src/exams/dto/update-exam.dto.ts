import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsIn,
  IsOptional,
} from 'class-validator';
import { EXAM_CATEGORIES } from '../exams.schema';

export class UpdateExamDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name?: string;

  @IsOptional()
  @IsIn(EXAM_CATEGORIES, {
    message: `La categoría debe ser una de: ${EXAM_CATEGORIES.join(', ')}.`,
  })
  category?: string;
}
