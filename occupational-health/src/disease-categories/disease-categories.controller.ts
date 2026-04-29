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
import { DiseaseCategoriesService } from './disease-categories.service';
import { CreateDiseaseCategoryDto } from './dto/create-disease-category.dto';
import { UpdateDiseaseCategoryDto } from './dto/update-disease-category.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('disease-categories')
export class DiseaseCategoriesController {
  constructor(
    private readonly diseaseCategoriesService: DiseaseCategoriesService,
  ) {}

  @Get()
  async findAll() {
    const diseaseCategories = await this.diseaseCategoriesService.findAll();
    return { diseaseCategories };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const diseaseCategory = await this.diseaseCategoriesService.findOne(id);
    return { diseaseCategory };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateDiseaseCategoryDto) {
    const diseaseCategory = await this.diseaseCategoriesService.create(dto);
    return { diseaseCategory };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiseaseCategoryDto,
  ) {
    const diseaseCategory = await this.diseaseCategoriesService.update(id, dto);
    return { diseaseCategory };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const diseaseCategory = await this.diseaseCategoriesService.remove(id);
    return { diseaseCategory };
  }
}
