import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdatePhysicalExamDto {
  @IsOptional()
  @IsNumber({}, { message: 'La presión sistólica debe ser un número.' })
  @Min(0, { message: 'La presión sistólica no puede ser negativa.' })
  @Max(300, { message: 'La presión sistólica no puede exceder 300 mmHg.' })
  systolicPressure?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La presión diastólica debe ser un número.' })
  @Min(0, { message: 'La presión diastólica no puede ser negativa.' })
  @Max(200, { message: 'La presión diastólica no puede exceder 200 mmHg.' })
  diastolicPressure?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La frecuencia cardíaca debe ser un número.' })
  @Min(0, { message: 'La frecuencia cardíaca no puede ser negativa.' })
  @Max(300, { message: 'La frecuencia cardíaca no puede exceder 300 lpm.' })
  heartRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número.' })
  @Min(0, { message: 'El peso no puede ser negativo.' })
  @Max(500, { message: 'El peso no puede exceder 500 kg.' })
  weight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La altura debe ser un número.' })
  @Min(0, { message: 'La altura no puede ser negativa.' })
  @Max(250, { message: 'La altura no puede exceder 250 cm.' })
  height?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La frecuencia respiratoria debe ser un número.' })
  @Min(0, { message: 'La frecuencia respiratoria no puede ser negativa.' })
  @Max(100, { message: 'La frecuencia respiratoria no puede exceder 100 rpm.' })
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La saturación de oxígeno debe ser un número.' })
  @Min(0, { message: 'La saturación de oxígeno no puede ser negativa.' })
  @Max(100, { message: 'La saturación de oxígeno no puede exceder 100%.' })
  oxygenSaturation?: number;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto.' })
  notes?: string;
}
