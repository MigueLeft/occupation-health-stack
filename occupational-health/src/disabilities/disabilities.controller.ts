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
import { DisabilitiesService } from './disabilities.service';
import { CreateDisabilityDto } from './dto/create-disability.dto';
import { UpdateDisabilityDto } from './dto/update-disability.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('disabilities')
export class DisabilitiesController {
  constructor(private readonly disabilitiesService: DisabilitiesService) {}

  @Get()
  async findAll() {
    const disabilities = await this.disabilitiesService.findAll();
    return { disabilities };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const disability = await this.disabilitiesService.findOne(id);
    return { disability };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateDisabilityDto) {
    const disability = await this.disabilitiesService.create(dto);
    return { disability };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDisabilityDto,
  ) {
    const disability = await this.disabilitiesService.update(id, dto);
    return { disability };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const disability = await this.disabilitiesService.remove(id);
    return { disability };
  }
}
