import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateIf,
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

  // Requerido cuando no se envía accidentTypeId
  @ValidateIf((o: { accidentTypeId?: string }) => !o.accidentTypeId)
  @IsUUID('4', {
    message: 'El ID de la enfermedad (CIE-10) debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message:
      'Se requiere una enfermedad o un tipo de accidente para el diagnóstico.',
  })
  diseaseId?: string;

  // Requerido cuando no se envía diseaseId
  @ValidateIf((o: { diseaseId?: string }) => !o.diseaseId)
  @IsUUID('4', {
    message: 'El ID del tipo de accidente debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message:
      'Se requiere un tipo de accidente o una enfermedad para el diagnóstico.',
  })
  accidentTypeId?: string;

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
