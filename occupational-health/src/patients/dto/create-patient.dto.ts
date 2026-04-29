import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
  IsArray,
  ValidateNested,
  ArrayUnique,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmergencyContactDto } from './emergency-contact.dto';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DOMINANT_HANDS = ['right', 'left', 'both'];

export class CreatePatientDto {
  @IsString({ message: 'La cédula debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La cédula de identidad es obligatoria.' })
  @Matches(/^[VEve]-?\d{7,}$/, {
    message: 'La cédula debe tener al menos 7 dígitos y comenzar con V o E.',
  })
  @MaxLength(20, { message: 'La cédula no puede exceder los 20 caracteres.' })
  cedula: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del paciente es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  firstName: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido del paciente es obligatorio.' })
  @MaxLength(255, {
    message: 'El apellido no puede exceder los 255 caracteres.',
  })
  lastName: string;

  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe tener el formato YYYY-MM-DD.' },
  )
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria.' })
  birthDate: string;

  @ValidateNested({
    message: 'El contacto de emergencia tiene campos inválidos.',
  })
  @Type(() => EmergencyContactDto)
  @IsNotEmpty({ message: 'El contacto de emergencia es obligatorio.' })
  emergencyContact: EmergencyContactDto;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @IsOptional()
  @IsIn(BLOOD_TYPES, {
    message: `El grupo sanguíneo debe ser uno de los siguientes: ${BLOOD_TYPES.join(', ')}.`,
  })
  bloodType?: string;

  @IsOptional()
  @IsIn(DOMINANT_HANDS, {
    message: `La mano dominante debe ser una de las siguientes: ${DOMINANT_HANDS.join(', ')}.`,
  })
  dominantHand?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El campo de uso de lentes debe ser verdadero o falso.',
  })
  usesGlasses?: boolean;

  @IsUUID('4', { message: 'El ID de la empresa debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio.' })
  companyId: string;

  @IsUUID('4', { message: 'El ID del cargo debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del cargo es obligatorio.' })
  positionId: string;

  @IsOptional()
  @IsArray({ message: 'Las alergias deben enviarse como un arreglo de IDs.' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de alergia debe ser un UUID válido.',
  })
  @ArrayUnique({ message: 'No se permiten alergias duplicadas.' })
  allergyIds?: string[];

  @IsOptional()
  @IsArray({
    message: 'Las enfermedades deben enviarse como un arreglo de IDs.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de enfermedad debe ser un UUID válido.',
  })
  @ArrayUnique({ message: 'No se permiten enfermedades duplicadas.' })
  diseaseIds?: string[];
}
