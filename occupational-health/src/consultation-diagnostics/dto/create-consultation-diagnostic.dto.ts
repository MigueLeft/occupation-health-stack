import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateConsultationDiagnosticDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsUUID('4', {
    message: 'El ID de la categoría de diagnóstico debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'El ID de la categoría de diagnóstico es obligatorio.',
  })
  categoryId: string;

  @IsUUID('4', {
    message: 'El ID de la enfermedad (CIE-10) debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El ID de la enfermedad es obligatorio.' })
  diseaseId: string;

  @IsUUID('4', {
    message: 'El ID del aparato/sistema afectado debe ser un UUID válido.',
  })
  @IsOptional()
  bodySystemId?: string;

  @IsBoolean({ message: 'requiresRest debe ser un booleano.' })
  @IsOptional()
  requiresRest?: boolean;

  @IsInt({ message: 'restDays debe ser un número entero.' })
  @Min(1, { message: 'Los días de reposo deben ser al menos 1.' })
  @Max(365, { message: 'Los días de reposo no pueden superar 365.' })
  @IsOptional()
  restDays?: number;
}
