import {
  Controller,
  Get,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { ConsultationDisabilitiesService } from './consultation-disabilities.service';
import { UpsertConsultationDisabilityDto } from './dto/upsert-consultation-disability.dto';

@Controller('consultation-disabilities')
export class ConsultationDisabilitiesController {
  constructor(
    private readonly consultationDisabilitiesService: ConsultationDisabilitiesService,
  ) {}

  @Get()
  async findByConsultation(@Query('consultationId') consultationId: string) {
    const consultationDisability =
      await this.consultationDisabilitiesService.findByConsultation(consultationId);
    return { consultationDisability };
  }

  @Post()
  async upsert(@Body() dto: UpsertConsultationDisabilityDto) {
    const consultationDisability =
      await this.consultationDisabilitiesService.upsert(dto);
    return { consultationDisability };
  }
}
