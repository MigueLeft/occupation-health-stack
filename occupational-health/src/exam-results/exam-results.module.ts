import { Module } from '@nestjs/common';
import { ExamResultsController } from './exam-results.controller';
import { ExamResultsService } from './exam-results.service';

@Module({
  controllers: [ExamResultsController],
  providers: [ExamResultsService],
})
export class ExamResultsModule {}
