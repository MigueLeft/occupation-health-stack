import {
  IsBoolean,
  IsOptional,
  IsInt,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateRestPeriodDto {
  @IsOptional()
  @IsBoolean({
    message: 'El campo "requiere reposo" debe ser verdadero o falso.',
  })
  requiresRest?: boolean;

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
  @IsUUID('4', { message: 'El ID de la enfermedad debe ser un UUID válido.' })
  diseaseId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido.' })
  categoryId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del aparato/sistema debe ser un UUID válido.' })
  bodySystemId?: string | null;
}
