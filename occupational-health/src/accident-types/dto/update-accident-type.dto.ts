import { PartialType } from '@nestjs/mapped-types';
import { CreateAccidentTypeDto } from './create-accident-type.dto';

export class UpdateAccidentTypeDto extends PartialType(CreateAccidentTypeDto) {}
