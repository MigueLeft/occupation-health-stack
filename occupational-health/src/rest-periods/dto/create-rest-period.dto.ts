import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';
import { REST_PERIOD_REASONS } from '../rest-periods.schema';

export class CreateRestPeriodDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsBoolean({
    message: 'El campo "requiere reposo" debe ser verdadero o falso.',
  })
  requiresRest: boolean;

  @IsOptional()
  @IsInt({ message: 'La cantidad de días debe ser un número entero.' })
  @Min(1, { message: 'La cantidad de días debe ser al menos 1.' })
  days?: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener el formato YYYY-MM-DD.' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener el formato YYYY-MM-DD.' },
  )
  endDate?: string;

  @IsOptional()
  @IsIn(REST_PERIOD_REASONS, {
    message: `El motivo del reposo debe ser uno de los siguientes: ${REST_PERIOD_REASONS.join(', ')}.`,
  })
  reason?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la enfermedad debe ser un UUID válido.' })
  diseaseId?: string;
}
