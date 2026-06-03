import { IsUUID, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class UpsertConsultationDisabilityDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsBoolean({
    message: 'El campo "tiene discapacidad" debe ser verdadero o falso.',
  })
  hasDisability: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la discapacidad debe ser un UUID válido.' })
  disabilityId?: string;
}
