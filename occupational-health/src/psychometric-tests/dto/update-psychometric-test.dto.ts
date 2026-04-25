import { PartialType } from '@nestjs/mapped-types';
import { CreatePsychometricTestDto } from './create-psychometric-test.dto';

export class UpdatePsychometricTestDto extends PartialType(
  CreatePsychometricTestDto,
) {}
