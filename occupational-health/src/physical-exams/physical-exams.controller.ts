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
import { PhysicalExamsService } from './physical-exams.service';
import { CreatePhysicalExamDto } from './dto/create-physical-exam.dto';
import { UpdatePhysicalExamDto } from './dto/update-physical-exam.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('physical-exams')
export class PhysicalExamsController {
  constructor(private readonly physicalExamsService: PhysicalExamsService) {}

  // Permite filtrar por consulta: GET /physical-exams?consultationId=<uuid>
  @Get()
  @RequirePermission('consultations', 'view')
  async findAll(@Query('consultationId') consultationId?: string) {
    const physicalExams =
      await this.physicalExamsService.findAll(consultationId);
    return { physicalExams };
  }

  @Get(':id')
  @RequirePermission('consultations', 'view')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const physicalExam = await this.physicalExamsService.findOne(id);
    return { physicalExam };
  }

  @Post()
  @RequirePermission('consultations', 'create')
  async create(@Body() dto: CreatePhysicalExamDto) {
    const physicalExam = await this.physicalExamsService.create(dto);
    return { physicalExam };
  }

  @Patch(':id')
  @RequirePermission('consultations', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePhysicalExamDto,
  ) {
    const physicalExam = await this.physicalExamsService.update(id, dto);
    return { physicalExam };
  }

  @Delete(':id')
  @RequirePermission('consultations', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const physicalExam = await this.physicalExamsService.remove(id);
    return { physicalExam };
  }
}
