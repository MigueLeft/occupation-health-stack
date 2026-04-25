import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class EmergencyContactDto {
  @IsString({ message: 'El nombre del contacto debe ser una cadena de texto.' })
  @IsNotEmpty({
    message: 'El nombre del contacto de emergencia es obligatorio.',
  })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @IsNotEmpty({
    message: 'El teléfono del contacto de emergencia es obligatorio.',
  })
  @MaxLength(50, { message: 'El teléfono no puede exceder los 50 caracteres.' })
  phone: string;

  @IsString({ message: 'El parentesco debe ser una cadena de texto.' })
  @IsNotEmpty({
    message: 'El parentesco del contacto de emergencia es obligatorio.',
  })
  @MaxLength(100, {
    message: 'El parentesco no puede exceder los 100 caracteres.',
  })
  relationship: string;
}
