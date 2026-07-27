import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class PatientHistoryReportDto {
  @IsString({ message: 'La cédula debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La cédula del paciente es obligatoria.' })
  cedula: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
