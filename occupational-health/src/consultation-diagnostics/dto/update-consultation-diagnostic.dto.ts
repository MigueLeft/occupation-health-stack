import { PartialType } from '@nestjs/mapped-types';
import { CreateConsultationDiagnosticDto } from './create-consultation-diagnostic.dto';

export class UpdateConsultationDiagnosticDto extends PartialType(
  CreateConsultationDiagnosticDto,
) {}
