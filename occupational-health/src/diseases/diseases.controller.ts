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
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('diseases')
export class DiseasesController {
  constructor(private readonly diseasesService: DiseasesService) {}

  @Get()
  async findAll() {
    const diseases = await this.diseasesService.findAll();
    return { diseases };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const disease = await this.diseasesService.findOne(id);
    return { disease };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateDiseaseDto) {
    const disease = await this.diseasesService.create(dto);
    return { disease };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiseaseDto,
  ) {
    const disease = await this.diseasesService.update(id, dto);
    return { disease };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const disease = await this.diseasesService.remove(id);
    return { disease };
  }
}
