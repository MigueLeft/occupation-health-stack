import { IsDateString, IsOptional, IsIn } from 'class-validator';
import {
  EVALUATION_REASONS,
  REQUEST_STATUSES,
  CONSULTATION_TYPES,
} from '../requests.schema';

export class UpdateRequestDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de solicitud debe tener el formato YYYY-MM-DD.' },
  )
  requestDate?: string;

  @IsOptional()
  @IsIn(EVALUATION_REASONS, {
    message: `El motivo de evaluación debe ser uno de: ${EVALUATION_REASONS.join(', ')}.`,
  })
  evaluationReason?: string;

  @IsOptional()
  @IsIn(REQUEST_STATUSES, {
    message: `El estatus debe ser uno de: ${REQUEST_STATUSES.join(', ')}.`,
  })
  status?: string;

  @IsOptional()
  @IsIn(CONSULTATION_TYPES, {
    message: `El tipo de consulta programada debe ser uno de: ${CONSULTATION_TYPES.join(', ')}.`,
  })
  scheduledConsultationType?: string;

  @IsOptional()
  @IsIn(CONSULTATION_TYPES, {
    message: `El tipo de consulta realizada debe ser uno de: ${CONSULTATION_TYPES.join(', ')}.`,
  })
  performedConsultationType?: string;
}
