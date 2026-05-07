import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMedicalSpecialtyDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la especialidad es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;
}
