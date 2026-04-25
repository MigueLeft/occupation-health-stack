import { IsOptional, IsString } from 'class-validator';

export class RecommendationsDto {
  @IsOptional()
  @IsString({ message: 'El EPP sugerido debe ser una cadena de texto.' })
  suggestedPPE?: string;

  @IsOptional()
  @IsString({
    message: 'Las medidas de adecuación médica deben ser una cadena de texto.',
  })
  medicalAdequacyMeasures?: string;

  @IsOptional()
  @IsString({
    message:
      'Las medidas de adecuación psicológica deben ser una cadena de texto.',
  })
  psychologicalAdequacyMeasures?: string;
}
