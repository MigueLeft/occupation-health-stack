import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConsultationDiagnosticsService } from './consultation-diagnostics.service';
import { CreateConsultationDiagnosticDto } from './dto/create-consultation-diagnostic.dto';
import { UpdateConsultationDiagnosticDto } from './dto/update-consultation-diagnostic.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('consultation-diagnostics')
export class ConsultationDiagnosticsController {
  constructor(
    private readonly consultationDiagnosticsService: ConsultationDiagnosticsService,
  ) {}

  @Get()
  @RequirePermission('consultations', 'view')
  async findAll(@Query('consultationId') consultationId?: string) {
    const consultationDiagnostics =
      await this.consultationDiagnosticsService.findAll(consultationId);
    return { consultationDiagnostics };
  }

  @Get(':id')
  @RequirePermission('consultations', 'view')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.findOne(id);
    return { consultationDiagnostic };
  }

  @Post()
  @RequirePermission('consultations', 'create')
  async create(@Body() dto: CreateConsultationDiagnosticDto) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.create(dto);
    return { consultationDiagnostic };
  }

  @Patch(':id')
  @RequirePermission('consultations', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConsultationDiagnosticDto,
  ) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.update(id, dto);
    return { consultationDiagnostic };
  }

  @Delete(':id')
  @RequirePermission('consultations', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.remove(id);
    return { consultationDiagnostic };
  }
}
