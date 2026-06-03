import { Module } from '@nestjs/common';
import { ReportConfigController } from './report-config.controller';
import { ReportConfigService } from './report-config.service';

@Module({
  controllers: [ReportConfigController],
  providers: [ReportConfigService],
  exports: [ReportConfigService],
})
export class ReportConfigModule {}
