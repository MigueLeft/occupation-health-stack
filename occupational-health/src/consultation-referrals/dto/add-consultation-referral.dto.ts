import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddConsultationReferralDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsUUID('4', {
    message: 'El ID de la especialidad médica debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El ID de la especialidad médica es obligatorio.' })
  specialtyId: string;
}
