import { Module } from '@nestjs/common';
import { RestPeriodsController } from './rest-periods.controller';
import { RestPeriodsService } from './rest-periods.service';

@Module({
  controllers: [RestPeriodsController],
  providers: [RestPeriodsService],
})
export class RestPeriodsModule {}
