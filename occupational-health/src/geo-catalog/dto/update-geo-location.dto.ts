import { IsString, IsNotEmpty, MaxLength, IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { GEO_TYPES } from '../geo-catalog.schema';

export class UpdateGeoLocationDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name?: string;

  @IsOptional()
  @IsIn(GEO_TYPES, {
    message: `El tipo debe ser uno de: ${GEO_TYPES.join(', ')}.`,
  })
  type?: string;
}
