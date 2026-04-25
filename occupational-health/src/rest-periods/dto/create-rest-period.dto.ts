import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  IsDateString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateRestPeriodDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsBoolean({
    message: 'El campo "requiere reposo" debe ser verdadero o falso.',
  })
  requiresRest: boolean;

  // Los siguientes campos son obligatorios solo cuando requiresRest es true
  @ValidateIf((o) => o.requiresRest === true)
  @IsInt({ message: 'La cantidad de días debe ser un número entero.' })
  @Min(1, { message: 'La cantidad de días debe ser al menos 1.' })
  days?: number;

  @ValidateIf((o) => o.requiresRest === true)
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener el formato YYYY-MM-DD.' },
  )
  @IsNotEmpty({
    message:
      'La fecha de inicio del reposo es obligatoria cuando requiere reposo.',
  })
  startDate?: string;

  @ValidateIf((o) => o.requiresRest === true)
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener el formato YYYY-MM-DD.' },
  )
  @IsNotEmpty({
    message:
      'La fecha de fin del reposo es obligatoria cuando requiere reposo.',
  })
  endDate?: string;
}
