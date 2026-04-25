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
import { PsychometricTestsService } from './psychometric-tests.service';
import { CreatePsychometricTestDto } from './dto/create-psychometric-test.dto';
import { UpdatePsychometricTestDto } from './dto/update-psychometric-test.dto';

@Controller('psychometric-tests')
export class PsychometricTestsController {
  constructor(
    private readonly psychometricTestsService: PsychometricTestsService,
  ) {}

  @Get()
  async findAll(@Query('consultationId') consultationId?: string) {
    const psychometricTests =
      await this.psychometricTestsService.findAll(consultationId);
    return { psychometricTests };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const psychometricTest = await this.psychometricTestsService.findOne(id);
    return { psychometricTest };
  }

  @Post()
  async create(@Body() dto: CreatePsychometricTestDto) {
    const psychometricTest = await this.psychometricTestsService.create(dto);
    return { psychometricTest };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePsychometricTestDto,
  ) {
    const psychometricTest = await this.psychometricTestsService.update(
      id,
      dto,
    );
    return { psychometricTest };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const psychometricTest = await this.psychometricTestsService.remove(id);
    return { psychometricTest };
  }
}
