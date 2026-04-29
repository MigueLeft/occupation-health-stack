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
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  // Permite filtrar por empresa: GET /positions?companyId=<uuid>
  @Get()
  @RequirePermission('positions', 'view')
  async findAll(@Query('companyId') companyId?: string) {
    const positions = await this.positionsService.findAll(companyId);
    return { positions };
  }

  @Get(':id')
  @RequirePermission('positions', 'view')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const position = await this.positionsService.findOne(id);
    return { position };
  }

  @Post()
  @RequirePermission('positions', 'create')
  async create(@Body() dto: CreatePositionDto) {
    const position = await this.positionsService.create(dto);
    return { position };
  }

  @Patch(':id')
  @RequirePermission('positions', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    const position = await this.positionsService.update(id, dto);
    return { position };
  }

  @Delete(':id')
  @RequirePermission('positions', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const position = await this.positionsService.remove(id);
    return { position };
  }
}
