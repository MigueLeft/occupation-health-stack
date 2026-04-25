import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsIn,
  IsOptional,
} from 'class-validator';
import { RISK_TYPES } from '../risks.schema';

export class UpdateRiskDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name?: string;

  @IsOptional()
  @IsIn(RISK_TYPES, {
    message: `El tipo de riesgo debe ser uno de: ${RISK_TYPES.join(', ')}.`,
  })
  type?: string;
}
