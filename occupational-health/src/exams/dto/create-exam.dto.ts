import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { EXAM_CATEGORIES } from '../exams.schema';

export class CreateExamDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del examen es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsIn(EXAM_CATEGORIES, { message: `La categoría debe ser una de: ${EXAM_CATEGORIES.join(', ')}.` })
  @IsNotEmpty({ message: 'La categoría del examen es obligatoria.' })
  category: string;
}
