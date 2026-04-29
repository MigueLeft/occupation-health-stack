import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { RISK_TYPES } from '../risks.schema';

export class CreateRiskDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del riesgo es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsIn(RISK_TYPES, {
    message: `El tipo de riesgo debe ser uno de: ${RISK_TYPES.join(', ')}.`,
  })
  @IsNotEmpty({ message: 'El tipo de riesgo es obligatorio.' })
  type: string;
}
