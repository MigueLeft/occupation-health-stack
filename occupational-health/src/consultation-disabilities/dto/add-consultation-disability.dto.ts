import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddConsultationDisabilityDto {
  @IsUUID('4', { message: 'El ID de la consulta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la consulta es obligatorio.' })
  consultationId: string;

  @IsUUID('4', { message: 'El ID de la discapacidad debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la discapacidad es obligatorio.' })
  disabilityId: string;
}
