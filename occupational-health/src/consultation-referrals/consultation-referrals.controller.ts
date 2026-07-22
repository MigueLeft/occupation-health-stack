import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConsultationReferralsService } from './consultation-referrals.service';
import { AddConsultationReferralDto } from './dto/add-consultation-referral.dto';

@Controller('consultation-referrals')
export class ConsultationReferralsController {
  constructor(
    private readonly consultationReferralsService: ConsultationReferralsService,
  ) {}

  @Get()
  async findByConsultation(@Query('consultationId') consultationId: string) {
    const consultationReferrals =
      await this.consultationReferralsService.findByConsultation(
        consultationId,
      );
    return { consultationReferrals };
  }

  @Post()
  async add(@Body() dto: AddConsultationReferralDto) {
    const consultationReferral =
      await this.consultationReferralsService.add(dto);
    return { consultationReferral };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.consultationReferralsService.remove(id);
    return {};
  }
}
