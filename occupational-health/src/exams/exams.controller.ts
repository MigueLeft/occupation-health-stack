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
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // Permite filtrar el catálogo por categoría: GET /exams?category=Laboratorio
  @Get()
  async findAll(@Query('category') category?: string) {
    const exams = await this.examsService.findAll(category);
    return { exams };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const exam = await this.examsService.findOne(id);
    return { exam };
  }

  @Post()
  async create(@Body() dto: CreateExamDto) {
    const exam = await this.examsService.create(dto);
    return { exam };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExamDto,
  ) {
    const exam = await this.examsService.update(id, dto);
    return { exam };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const exam = await this.examsService.remove(id);
    return { exam };
  }
}
