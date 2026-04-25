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
import { ExamResultsService } from './exam-results.service';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';

@Controller('exam-results')
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) {}

  // Permite filtrar por consulta: GET /exam-results?consultationId=<uuid>
  @Get()
  async findAll(@Query('consultationId') consultationId?: string) {
    const examResults = await this.examResultsService.findAll(consultationId);
    return { examResults };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const examResult = await this.examResultsService.findOne(id);
    return { examResult };
  }

  @Post()
  async create(@Body() dto: CreateExamResultDto) {
    const examResult = await this.examResultsService.create(dto);
    return { examResult };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExamResultDto,
  ) {
    const examResult = await this.examResultsService.update(id, dto);
    return { examResult };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const examResult = await this.examResultsService.remove(id);
    return { examResult };
  }
}
