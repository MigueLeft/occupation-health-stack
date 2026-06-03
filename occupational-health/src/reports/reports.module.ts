import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportConfigModule } from '../report-config/report-config.module';

@Module({
  imports: [ReportConfigModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
