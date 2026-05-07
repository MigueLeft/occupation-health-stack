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
  CONSULTATION_STATUSES,
  CONSULTATION_TYPES,
  PSYCHOLOGICAL_RESULTS,
  PSYCHOLOGICAL_APTITUDES,
} from '../consultations.schema';
import { RecommendationsDto } from './recommendations.dto';

export class UpdateConsultationDto {
  @IsOptional()
  @IsIn(CONSULTATION_TYPES, {
    message: `El tipo de consulta debe ser uno de: ${CONSULTATION_TYPES.join(', ')}.`,
  })
  type?: string;

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
  @IsIn(PSYCHOLOGICAL_APTITUDES, {
    message: `La aptitud psicológica debe ser una de: ${PSYCHOLOGICAL_APTITUDES.join(', ')}.`,
  })
  psychologicalAptitude?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo paciente sano debe ser verdadero o falso.' })
  isHealthy?: boolean;

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
  observations?: { medica?: string; psicologica?: string; aptitudeDetails?: string };

  @IsOptional()
  @IsIn(CONSULTATION_STATUSES, {
    message: `El estado debe ser uno de: ${CONSULTATION_STATUSES.join(', ')}.`,
  })
  status?: string;

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
