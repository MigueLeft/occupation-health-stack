import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class ConsolidacionReportDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsUUID('4')
  companyId?: string;
}
