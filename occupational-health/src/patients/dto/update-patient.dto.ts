import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
  IsArray,
  ValidateNested,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmergencyContactDto } from './emergency-contact.dto';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DOMINANT_HANDS = ['right', 'left', 'both'];
const SEX_OPTIONS = ['Masculino', 'Femenino'];

export class UpdatePatientDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío.' })
  @MaxLength(255, {
    message: 'El apellido no puede exceder los 255 caracteres.',
  })
  lastName?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe tener el formato YYYY-MM-DD.' },
  )
  birthDate?: string;

  @IsOptional()
  @ValidateNested({
    message: 'El contacto de emergencia tiene campos inválidos.',
  })
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

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
  @IsIn(SEX_OPTIONS, {
    message: `El sexo debe ser uno de los siguientes: ${SEX_OPTIONS.join(', ')}.`,
  })
  sex?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El campo de uso de lentes debe ser verdadero o falso.',
  })
  usesGlasses?: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la empresa debe ser un UUID válido.' })
  companyId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del cargo debe ser un UUID válido.' })
  positionId?: string;

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
