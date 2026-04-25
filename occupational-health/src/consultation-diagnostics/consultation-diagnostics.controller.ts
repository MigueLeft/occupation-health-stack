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

@Controller('consultation-diagnostics')
export class ConsultationDiagnosticsController {
  constructor(
    private readonly consultationDiagnosticsService: ConsultationDiagnosticsService,
  ) {}

  @Get()
  async findAll(@Query('consultationId') consultationId?: string) {
    const consultationDiagnostics =
      await this.consultationDiagnosticsService.findAll(consultationId);
    return { consultationDiagnostics };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.findOne(id);
    return { consultationDiagnostic };
  }

  @Post()
  async create(@Body() dto: CreateConsultationDiagnosticDto) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.create(dto);
    return { consultationDiagnostic };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConsultationDiagnosticDto,
  ) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.update(id, dto);
    return { consultationDiagnostic };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const consultationDiagnostic =
      await this.consultationDiagnosticsService.remove(id);
    return { consultationDiagnostic };
  }
}
