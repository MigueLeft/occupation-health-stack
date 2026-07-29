import { IsUUID, IsNotEmpty, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class UpsertConsultationReferralDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsBoolean({
    message: 'El campo "requiere referencia" debe ser verdadero o falso.',
  })
  requiresReferral: boolean;

  @IsOptional()
  @IsArray({ message: 'Las especialidades médicas deben ser un arreglo.' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de especialidad médica debe ser un UUID válido.',
  })
  specialtyIds?: string[];
}
