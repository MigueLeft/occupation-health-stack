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
import { RisksService } from './risks.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';

@Controller('risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  // Permite filtrar el catálogo por tipo: GET /risks?type=Fisico
  @Get()
  async findAll(@Query('type') type?: string) {
    const risks = await this.risksService.findAll(type);
    return { risks };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const risk = await this.risksService.findOne(id);
    return { risk };
  }

  @Post()
  async create(@Body() dto: CreateRiskDto) {
    const risk = await this.risksService.create(dto);
    return { risk };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRiskDto,
  ) {
    const risk = await this.risksService.update(id, dto);
    return { risk };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const risk = await this.risksService.remove(id);
    return { risk };
  }
}
