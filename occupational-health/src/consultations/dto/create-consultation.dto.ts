import {
  IsUUID,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CONSULTATION_TYPES,
  CONSULTATION_RESULTS,
  PSYCHOLOGICAL_RESULTS,
} from '../consultations.schema';
import { RecommendationsDto } from './recommendations.dto';

export class CreateConsultationDto {
  @IsUUID('4', { message: 'El ID de la solicitud debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la solicitud es obligatorio.' })
  requestId: string;

  @IsIn(CONSULTATION_TYPES, {
    message: `El tipo de consulta debe ser uno de: ${CONSULTATION_TYPES.join(', ')}.`,
  })
  @IsNotEmpty({ message: 'El tipo de consulta es obligatorio.' })
  type: string;

  @IsOptional()
  @IsString({ message: 'El tratamiento actual debe ser una cadena de texto.' })
  currentTreatment?: string;

  // Solo aplica para consultas de tipo Psicológica
  @IsOptional()
  @IsBoolean({
    message: 'El campo de entrevista realizada debe ser verdadero o falso.',
  })
  interviewConducted?: boolean;

  // Resultado de la consulta médica
  @IsOptional()
  @IsIn(CONSULTATION_RESULTS, {
    message: `El resultado de la consulta debe ser uno de: ${CONSULTATION_RESULTS.join(', ')}.`,
  })
  consultationResult?: string;

  // Resultado de la evaluación psicológica
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
}
