import { IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateDisabilityDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede superar los 255 caracteres.' })
  name?: string;
}
