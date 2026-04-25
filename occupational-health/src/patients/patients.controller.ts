import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll() {
    const patients = await this.patientsService.findAll();
    return { patients };
  }

  // La cédula es el identificador primario del paciente
  @Get(':cedula')
  async findOne(@Param('cedula') cedula: string) {
    const patient = await this.patientsService.findOne(cedula);
    return { patient };
  }

  @Post()
  async create(@Body() dto: CreatePatientDto) {
    const patient = await this.patientsService.create(dto);
    return { patient };
  }

  @Patch(':cedula')
  async update(@Param('cedula') cedula: string, @Body() dto: UpdatePatientDto) {
    const patient = await this.patientsService.update(cedula, dto);
    return { patient };
  }

  @Delete(':cedula')
  async remove(@Param('cedula') cedula: string) {
    const patient = await this.patientsService.remove(cedula);
    return { patient };
  }
}
