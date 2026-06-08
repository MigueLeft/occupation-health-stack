import { Controller, Get, Post, Query, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ConsultationReportDto } from './dto/consultation-report.dto';
import { VigilanciaReportDto } from './dto/vigilancia-report.dto';
import { PathologiesReportDto } from './dto/pathologies-report.dto';
import { BodySystemsReportDto } from './dto/body-systems-report.dto';
import { MorbidityReportDto } from './dto/morbidity-report.dto';
import { ConsolidacionReportDto } from './dto/consolidacion-report.dto';
import { PsychologicalIndicatorsReportDto } from './dto/psychological-indicators-report.dto';
import { PsychologicalMorbidityReportDto } from './dto/psychological-morbidity-report.dto';
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
    const buffer =
      await this.reportsService.generateConsultationsReport(filters);

    const filename = `reporte-consultas-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post('vigilancia')
  @RequirePermission('reports', 'view')
  async vigilanciaReport(
    @Body() filters: VigilanciaReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateVigilanciaReport(filters);

    const filename = `reporte-vigilancia-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('pathologies')
  @RequirePermission('reports', 'view')
  async pathologiesReport(
    @Query() filters: PathologiesReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generatePathologiesReport(filters);
    const filename = `reporte-patologias-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('body-systems')
  @RequirePermission('reports', 'view')
  async bodySystemsReport(
    @Query() filters: BodySystemsReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateBodySystemsReport(filters);
    const filename = `reporte-aparatos-sistemas-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('morbidity')
  @RequirePermission('reports', 'view')
  async morbidityReport(
    @Query() filters: MorbidityReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateMorbidityReport(filters);
    const filename = `reporte-morbilidad-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('consolidacion')
  @RequirePermission('reports', 'view')
  async consolidacionReport(
    @Query() filters: ConsolidacionReportDto,
    @Res() res: Response,
  ) {
    const buffer =
      await this.reportsService.generateConsolidacionReport(filters);
    const filename = `reporte-consolidacion-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('psychological-indicators')
  @RequirePermission('reports', 'view')
  async psychologicalIndicatorsReport(
    @Query() filters: PsychologicalIndicatorsReportDto,
    @Res() res: Response,
  ) {
    const buffer =
      await this.reportsService.generatePsychologicalIndicatorsReport(filters);
    const filename = `reporte-indicadores-psicologicos-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('psychological-morbidity')
  @RequirePermission('reports', 'view')
  async psychologicalMorbidityReport(
    @Query() filters: PsychologicalMorbidityReportDto,
    @Res() res: Response,
  ) {
    const buffer =
      await this.reportsService.generatePsychologicalMorbidityReport(filters);
    const filename = `reporte-morbilidad-psicologica-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
