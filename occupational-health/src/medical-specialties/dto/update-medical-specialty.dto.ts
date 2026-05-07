import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateMedicalSpecialtyDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name?: string;
}
