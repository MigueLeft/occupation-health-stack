import {
  IsIn,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CONSULTATION_RESULTS,
  PSYCHOLOGICAL_RESULTS,
} from '../consultations.schema';
import { RecommendationsDto } from './recommendations.dto';

export class UpdateConsultationDto {
  @IsOptional()
  @IsString({ message: 'El tratamiento actual debe ser una cadena de texto.' })
  currentTreatment?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El campo de entrevista realizada debe ser verdadero o falso.',
  })
  interviewConducted?: boolean;

  @IsOptional()
  @IsIn(CONSULTATION_RESULTS, {
    message: `El resultado de la consulta debe ser uno de: ${CONSULTATION_RESULTS.join(', ')}.`,
  })
  consultationResult?: string;

  @IsOptional()
  @IsIn(PSYCHOLOGICAL_RESULTS, {
    message: `El resultado psicológico debe ser uno de: ${PSYCHOLOGICAL_RESULTS.join(', ')}.`,
  })
  psychologicalResult?: string;

  @IsOptional()
  @IsString({
    message: 'La descripción del diagnóstico debe ser una cadena de texto.',
  })
  diagnosisDescription?: string;

  @IsOptional()
  @ValidateNested({
    message: 'Las recomendaciones contienen campos inválidos.',
  })
  @Type(() => RecommendationsDto)
  recommendations?: RecommendationsDto;

  @IsOptional()
  observations?: { medica?: string; psicologica?: string };

  @IsOptional()
  @IsString()
  systemAttendedById?: string;

  @IsOptional()
  @IsString()
  medicalAttendedById?: string;

  @IsOptional()
  @IsString()
  psychologicalAttendedById?: string;
}
