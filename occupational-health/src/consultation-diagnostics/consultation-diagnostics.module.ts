import { Module } from '@nestjs/common';
import { ConsultationDiagnosticsController } from './consultation-diagnostics.controller';
import { ConsultationDiagnosticsService } from './consultation-diagnostics.service';

@Module({
  controllers: [ConsultationDiagnosticsController],
  providers: [ConsultationDiagnosticsService],
})
export class ConsultationDiagnosticsModule {}
