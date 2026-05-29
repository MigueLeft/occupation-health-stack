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
import { RestPeriodsService } from './rest-periods.service';
import { CreateRestPeriodDto } from './dto/create-rest-period.dto';
import { UpdateRestPeriodDto } from './dto/update-rest-period.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('rest-periods')
export class RestPeriodsController {
  constructor(private readonly restPeriodsService: RestPeriodsService) {}

  // Permite filtrar por consulta: GET /rest-periods?consultationId=<uuid>
  @Get()
  @RequirePermission('consultations', 'view')
  async findAll(@Query('consultationId') consultationId?: string) {
    const restPeriods = await this.restPeriodsService.findAll(consultationId);
    return { restPeriods };
  }

  @Get(':id')
  @RequirePermission('consultations', 'view')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const restPeriod = await this.restPeriodsService.findOne(id);
    return { restPeriod };
  }

  @Post()
  @RequirePermission('consultations', 'create')
  async create(@Body() dto: CreateRestPeriodDto) {
    const restPeriod = await this.restPeriodsService.create(dto);
    return { restPeriod };
  }

  @Patch(':id')
  @RequirePermission('consultations', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestPeriodDto,
  ) {
    const restPeriod = await this.restPeriodsService.update(id, dto);
    return { restPeriod };
  }

  @Delete(':id')
  @RequirePermission('consultations', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const restPeriod = await this.restPeriodsService.remove(id);
    return { restPeriod };
  }
}
