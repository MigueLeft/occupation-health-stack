import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBodySystemDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del aparato/sistema es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;
}
