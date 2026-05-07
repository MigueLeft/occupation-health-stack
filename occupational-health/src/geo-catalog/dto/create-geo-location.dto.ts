import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { GEO_TYPES } from '../geo-catalog.schema';

export class CreateGeoLocationDto {
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @IsIn(GEO_TYPES, {
    message: `El tipo debe ser uno de: ${GEO_TYPES.join(', ')}.`,
  })
  type: string;
}
