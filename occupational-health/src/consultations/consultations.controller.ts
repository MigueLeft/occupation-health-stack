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
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  // Permite filtrar por solicitud: GET /consultations?requestId=<uuid>
  @Get()
  async findAll(@Query('requestId') requestId?: string) {
    const consultations = await this.consultationsService.findAll(requestId);
    return { consultations };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const consultation = await this.consultationsService.findOne(id);
    return { consultation };
  }

  @Post()
  async create(@Body() dto: CreateConsultationDto) {
    const consultation = await this.consultationsService.create(dto);
    return { consultation };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConsultationDto,
  ) {
    const consultation = await this.consultationsService.update(id, dto);
    return { consultation };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const consultation = await this.consultationsService.remove(id);
    return { consultation };
  }
}
