import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ConsultationReportDto } from './dto/consultation-report.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('consultations')
  @RequirePermission('reports', 'view')
  async consultationReport(
    @Query() filters: ConsultationReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateConsultationsReport(filters);

    const filename = `reporte-consultas-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
