import { PartialType } from '@nestjs/mapped-types';
import { CreateDiseaseCategoryDto } from './create-disease-category.dto';

export class UpdateDiseaseCategoryDto extends PartialType(
  CreateDiseaseCategoryDto,
) {}
