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
import { GeoCatalogService } from './geo-catalog.service';
import { CreateGeoLocationDto } from './dto/create-geo-location.dto';
import { UpdateGeoLocationDto } from './dto/update-geo-location.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('geo-catalog')
export class GeoCatalogController {
  constructor(private readonly geoCatalogService: GeoCatalogService) {}

  @Get()
  @RequirePermission('catalogs', 'view')
  async findAll(@Query('type') type?: string) {
    const geoLocations = await this.geoCatalogService.findAll(type);
    return { geoLocations };
  }

  @Get(':id')
  @RequirePermission('catalogs', 'view')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const geoLocation = await this.geoCatalogService.findOne(id);
    return { geoLocation };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreateGeoLocationDto) {
    const geoLocation = await this.geoCatalogService.create(dto);
    return { geoLocation };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGeoLocationDto,
  ) {
    const geoLocation = await this.geoCatalogService.update(id, dto);
    return { geoLocation };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const geoLocation = await this.geoCatalogService.remove(id);
    return { geoLocation };
  }
}
