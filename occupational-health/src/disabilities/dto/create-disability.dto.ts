import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDisabilityDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la discapacidad es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede superar los 255 caracteres.' })
  name: string;
}
