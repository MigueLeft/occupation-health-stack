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
import { AllergiesService } from './allergies.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Get()
  async findAll() {
    const allergies = await this.allergiesService.findAll();
    return { allergies };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const allergy = await this.allergiesService.findOne(id);
    return { allergy };
  }

  @Post()
  async create(@Body() dto: CreateAllergyDto) {
    const allergy = await this.allergiesService.create(dto);
    return { allergy };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAllergyDto,
  ) {
    const allergy = await this.allergiesService.update(id, dto);
    return { allergy };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const allergy = await this.allergiesService.remove(id);
    return { allergy };
  }
}
