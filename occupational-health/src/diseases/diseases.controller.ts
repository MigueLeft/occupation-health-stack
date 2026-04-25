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
  async create(@Body() dto: CreateDiseaseDto) {
    const disease = await this.diseasesService.create(dto);
    return { disease };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiseaseDto,
  ) {
    const disease = await this.diseasesService.update(id, dto);
    return { disease };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const disease = await this.diseasesService.remove(id);
    return { disease };
  }
}
