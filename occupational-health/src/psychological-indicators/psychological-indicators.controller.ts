import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PsychologicalIndicatorsService } from './psychological-indicators.service';
import { CreatePsychologicalIndicatorDto } from './dto/create-psychological-indicator.dto';
import { UpdatePsychologicalIndicatorDto } from './dto/update-psychological-indicator.dto';
import { CreateIndicatorValueDto } from './dto/create-indicator-value.dto';
import { UpdateIndicatorValueDto } from './dto/update-indicator-value.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('psychological-indicators')
export class PsychologicalIndicatorsController {
  constructor(
    private readonly psychologicalIndicatorsService: PsychologicalIndicatorsService,
  ) {}

  @Get()
  async findAll() {
    const indicators = await this.psychologicalIndicatorsService.findAll();
    return { indicators };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async createIndicator(@Body() dto: CreatePsychologicalIndicatorDto) {
    const indicator =
      await this.psychologicalIndicatorsService.createIndicator(dto);
    return { indicator };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async updateIndicator(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePsychologicalIndicatorDto,
  ) {
    const indicator =
      await this.psychologicalIndicatorsService.updateIndicator(id, dto);
    return { indicator };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async deleteIndicator(@Param('id', ParseUUIDPipe) id: string) {
    const indicator =
      await this.psychologicalIndicatorsService.deleteIndicator(id);
    return { indicator };
  }

  @Post(':indicatorId/values')
  @RequirePermission('catalogs', 'create')
  async createValue(
    @Param('indicatorId', ParseUUIDPipe) indicatorId: string,
    @Body() dto: CreateIndicatorValueDto,
  ) {
    const indicatorValue =
      await this.psychologicalIndicatorsService.createValue(indicatorId, dto);
    return { indicatorValue };
  }

  @Patch(':indicatorId/values/:valueId')
  @RequirePermission('catalogs', 'edit')
  async updateValue(
    @Param('indicatorId', ParseUUIDPipe) indicatorId: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
    @Body() dto: UpdateIndicatorValueDto,
  ) {
    const indicatorValue =
      await this.psychologicalIndicatorsService.updateValue(
        indicatorId,
        valueId,
        dto,
      );
    return { indicatorValue };
  }

  @Delete(':indicatorId/values/:valueId')
  @RequirePermission('catalogs', 'delete')
  async deleteValue(
    @Param('indicatorId', ParseUUIDPipe) indicatorId: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
  ) {
    const indicatorValue =
      await this.psychologicalIndicatorsService.deleteValue(
        indicatorId,
        valueId,
      );
    return { indicatorValue };
  }
}
