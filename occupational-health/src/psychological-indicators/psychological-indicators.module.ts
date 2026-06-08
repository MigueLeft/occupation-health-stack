import { Module } from '@nestjs/common';
import { PsychologicalIndicatorsController } from './psychological-indicators.controller';
import { PsychologicalIndicatorsService } from './psychological-indicators.service';

@Module({
  controllers: [PsychologicalIndicatorsController],
  providers: [PsychologicalIndicatorsService],
})
export class PsychologicalIndicatorsModule {}
