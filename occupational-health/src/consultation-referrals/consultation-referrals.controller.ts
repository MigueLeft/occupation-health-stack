import {
  Controller,
  Get,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { ConsultationReferralsService } from './consultation-referrals.service';
import { UpsertConsultationReferralDto } from './dto/upsert-consultation-referral.dto';

@Controller('consultation-referrals')
export class ConsultationReferralsController {
  constructor(
    private readonly consultationReferralsService: ConsultationReferralsService,
  ) {}

  @Get()
  async findByConsultation(@Query('consultationId') consultationId: string) {
    const consultationReferral =
      await this.consultationReferralsService.findByConsultation(consultationId);
    return { consultationReferral };
  }

  @Post()
  async upsert(@Body() dto: UpsertConsultationReferralDto) {
    const consultationReferral =
      await this.consultationReferralsService.upsert(dto);
    return { consultationReferral };
  }
}
