import { IsOptional, IsDateString, IsUUID, IsString, MaxLength } from 'class-validator';

export class VigilanciaReportDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener el formato YYYY-MM-DD.' },
  )
  dateFrom?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener el formato YYYY-MM-DD.' },
  )
  dateTo?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la empresa debe ser un UUID válido.' })
  companyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  recomendacion1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  recomendacion2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  recomendacion3?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  recomendacion4?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  recomendacion5?: string;
}
