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
import { MedicalSpecialtiesService } from './medical-specialties.service';
import { CreateMedicalSpecialtyDto } from './dto/create-medical-specialty.dto';
import { UpdateMedicalSpecialtyDto } from './dto/update-medical-specialty.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('medical-specialties')
export class MedicalSpecialtiesController {
  constructor(
    private readonly medicalSpecialtiesService: MedicalSpecialtiesService,
  ) {}

  @Get()
  async findAll() {
    const medicalSpecialties = await this.medicalSpecialtiesService.findAll();
    return { medicalSpecialties };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const medicalSpecialty = await this.medicalSpecialtiesService.findOne(id);
    return { medicalSpecialty };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateMedicalSpecialtyDto) {
    const medicalSpecialty = await this.medicalSpecialtiesService.create(dto);
    return { medicalSpecialty };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicalSpecialtyDto,
  ) {
    const medicalSpecialty = await this.medicalSpecialtiesService.update(
      id,
      dto,
    );
    return { medicalSpecialty };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const medicalSpecialty = await this.medicalSpecialtiesService.remove(id);
    return { medicalSpecialty };
  }
}
