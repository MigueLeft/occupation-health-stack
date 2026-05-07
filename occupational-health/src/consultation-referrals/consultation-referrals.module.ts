import { Module } from '@nestjs/common';
import { ConsultationReferralsController } from './consultation-referrals.controller';
import { ConsultationReferralsService } from './consultation-referrals.service';

@Module({
  controllers: [ConsultationReferralsController],
  providers: [ConsultationReferralsService],
})
export class ConsultationReferralsModule {}
