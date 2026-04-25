import {
  IsBoolean,
  IsOptional,
  IsInt,
  IsDateString,
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
}
