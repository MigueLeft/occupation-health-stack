import { PartialType } from '@nestjs/mapped-types';
import { CreatePsychometricTestCatalogDto } from './create-psychometric-test-catalog.dto';

export class UpdatePsychometricTestCatalogDto extends PartialType(
  CreatePsychometricTestCatalogDto,
) {}
