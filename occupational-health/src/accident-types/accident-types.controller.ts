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
import { AccidentTypesService } from './accident-types.service';
import { CreateAccidentTypeDto } from './dto/create-accident-type.dto';
import { UpdateAccidentTypeDto } from './dto/update-accident-type.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('accident-types')
export class AccidentTypesController {
  constructor(private readonly accidentTypesService: AccidentTypesService) {}

  @Get()
  async findAll() {
    const accidentTypes = await this.accidentTypesService.findAll();
    return { accidentTypes };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const accidentType = await this.accidentTypesService.findOne(id);
    return { accidentType };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateAccidentTypeDto) {
    const accidentType = await this.accidentTypesService.create(dto);
    return { accidentType };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccidentTypeDto,
  ) {
    const accidentType = await this.accidentTypesService.update(id, dto);
    return { accidentType };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const accidentType = await this.accidentTypesService.remove(id);
    return { accidentType };
  }
}
