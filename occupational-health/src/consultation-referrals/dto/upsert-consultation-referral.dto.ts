import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpsertConsultationReferralDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsBoolean({
    message: 'El campo "requiere referencia" debe ser verdadero o falso.',
  })
  requiresReferral: boolean;

  @IsOptional()
  @IsUUID('4', {
    message: 'El ID de la especialidad médica debe ser un UUID válido.',
  })
  specialtyId?: string;
}
