import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class ConsultationReportDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
