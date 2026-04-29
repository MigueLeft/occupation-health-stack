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
import { BodySystemsService } from './body-systems.service';
import { CreateBodySystemDto } from './dto/create-body-system.dto';
import { UpdateBodySystemDto } from './dto/update-body-system.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('body-systems')
export class BodySystemsController {
  constructor(private readonly bodySystemsService: BodySystemsService) {}

  @Get()
  async findAll() {
    const bodySystems = await this.bodySystemsService.findAll();
    return { bodySystems };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const bodySystem = await this.bodySystemsService.findOne(id);
    return { bodySystem };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateBodySystemDto) {
    const bodySystem = await this.bodySystemsService.create(dto);
    return { bodySystem };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBodySystemDto,
  ) {
    const bodySystem = await this.bodySystemsService.update(id, dto);
    return { bodySystem };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const bodySystem = await this.bodySystemsService.remove(id);
    return { bodySystem };
  }
}
