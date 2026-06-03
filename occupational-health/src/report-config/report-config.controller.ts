import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ReportConfigService } from './report-config.service';
import { UpdateReportConfigDto } from './dto/update-report-config.dto';

@Controller('report-config')
export class ReportConfigController {
  constructor(private readonly service: ReportConfigService) {}

  @Get()
  async getConfig() {
    const config = await this.service.getConfig();
    return { reportConfig: config };
  }

  @Patch()
  async updateConfig(@Body() dto: UpdateReportConfigDto) {
    const updated = await this.service.upsertSelloMedico(
      dto.selloMedico ?? null,
    );
    return { reportConfig: updated };
  }
}
