import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

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
}
