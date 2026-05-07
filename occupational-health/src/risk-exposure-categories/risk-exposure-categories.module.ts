import { Module } from '@nestjs/common';
import { RiskExposureCategoriesController } from './risk-exposure-categories.controller';
import { RiskExposureCategoriesService } from './risk-exposure-categories.service';

@Module({
  controllers: [RiskExposureCategoriesController],
  providers: [RiskExposureCategoriesService],
})
export class RiskExposureCategoriesModule {}
