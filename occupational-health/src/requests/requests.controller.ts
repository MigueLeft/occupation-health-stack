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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // Permite filtrar por paciente: GET /requests?patientId=<cedula>
  @Get()
  async findAll(@Query('patientId') patientId?: string) {
    const requests = await this.requestsService.findAll(patientId);
    return { requests };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const request = await this.requestsService.findOne(id);
    return { request };
  }

  @Post()
  async create(@Body() dto: CreateRequestDto) {
    const request = await this.requestsService.create(dto);
    return { request };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    const request = await this.requestsService.update(id, dto);
    return { request };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const request = await this.requestsService.remove(id);
    return { request };
  }
}
