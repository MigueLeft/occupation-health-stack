import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';
import { RISK_TYPES } from '../../risks/risks.schema';

export class CreateRiskExposureCategoryDto {
  @IsString({ message: 'El tipo de riesgo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El tipo de riesgo es obligatorio.' })
  @IsIn(RISK_TYPES, {
    message: `El tipo de riesgo debe ser uno de los siguientes: ${RISK_TYPES.join(', ')}.`,
  })
  riskType: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Las condiciones deben ser una cadena de texto.' })
  conditions?: string;

  @IsOptional()
  @IsString({
    message: 'Los efectos en la salud deben ser una cadena de texto.',
  })
  healthEffects?: string;
}
