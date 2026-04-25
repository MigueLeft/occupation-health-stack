import { Module } from '@nestjs/common';
import { PhysicalExamsController } from './physical-exams.controller';
import { PhysicalExamsService } from './physical-exams.service';

@Module({
  controllers: [PhysicalExamsController],
  providers: [PhysicalExamsService],
})
export class PhysicalExamsModule {}
