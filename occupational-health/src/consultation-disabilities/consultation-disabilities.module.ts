import { Module } from '@nestjs/common';
import { ConsultationDisabilitiesController } from './consultation-disabilities.controller';
import { ConsultationDisabilitiesService } from './consultation-disabilities.service';

@Module({
  controllers: [ConsultationDisabilitiesController],
  providers: [ConsultationDisabilitiesService],
})
export class ConsultationDisabilitiesModule {}
