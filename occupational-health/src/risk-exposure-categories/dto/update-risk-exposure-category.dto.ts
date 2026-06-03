import { IsString, IsOptional } from 'class-validator';

export class UpdateRiskExposureCategoryDto {
  @IsOptional()
  @IsString({
    message: 'Los efectos en la salud deben ser una cadena de texto.',
  })
  healthEffects?: string;
}
