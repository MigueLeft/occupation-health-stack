import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';
import {
  EVALUATION_REASONS,
  REQUEST_STATUSES,
  CONSULTATION_TYPES,
} from '../requests.schema';

export class CreateRequestDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de solicitud debe tener el formato YYYY-MM-DD.' },
  )
  requestDate?: string;

  @IsIn(EVALUATION_REASONS, {
    message: `El motivo de evaluación debe ser uno de: ${EVALUATION_REASONS.join(', ')}.`,
  })
  @IsNotEmpty({ message: 'El motivo de evaluación es obligatorio.' })
  evaluationReason: string;

  @IsOptional()
  @IsIn(REQUEST_STATUSES, {
    message: `El estatus debe ser uno de: ${REQUEST_STATUSES.join(', ')}.`,
  })
  status?: string;

  @IsString({ message: 'La cédula del paciente debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La cédula del paciente es obligatoria.' })
  patientId: string;

  @IsOptional()
  @IsIn(CONSULTATION_TYPES, {
    message: `El tipo de consulta programada debe ser uno de: ${CONSULTATION_TYPES.join(', ')}.`,
  })
  scheduledConsultationType?: string;
}
