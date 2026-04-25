import { PartialType } from '@nestjs/mapped-types';
import { CreateBodySystemDto } from './create-body-system.dto';

export class UpdateBodySystemDto extends PartialType(CreateBodySystemDto) {}
