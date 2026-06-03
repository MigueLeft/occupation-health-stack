import { IsString, IsOptional } from 'class-validator';

export class UpdateReportConfigDto {
  @IsString({ message: 'selloMedico debe ser un string (base64 de imagen).' })
  @IsOptional()
  selloMedico?: string | null;
}
