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
import { RiskExposureCategoriesService } from './risk-exposure-categories.service';
import { CreateRiskExposureCategoryDto } from './dto/create-risk-exposure-category.dto';
import { UpdateRiskExposureCategoryDto } from './dto/update-risk-exposure-category.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('risk-exposure-categories')
export class RiskExposureCategoriesController {
  constructor(
    private readonly riskExposureCategoriesService: RiskExposureCategoriesService,
  ) {}

  @Get()
  async findAll() {
    const riskExposureCategories =
      await this.riskExposureCategoriesService.findAll();
    return { riskExposureCategories };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const riskExposureCategory =
      await this.riskExposureCategoriesService.findOne(id);
    return { riskExposureCategory };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateRiskExposureCategoryDto) {
    const riskExposureCategory =
      await this.riskExposureCategoriesService.create(dto);
    return { riskExposureCategory };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRiskExposureCategoryDto,
  ) {
    const riskExposureCategory =
      await this.riskExposureCategoriesService.update(id, dto);
    return { riskExposureCategory };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const riskExposureCategory =
      await this.riskExposureCategoriesService.remove(id);
    return { riskExposureCategory };
  }
}
