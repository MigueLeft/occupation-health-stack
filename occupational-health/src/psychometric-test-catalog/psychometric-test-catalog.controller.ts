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
import { PsychometricTestCatalogService } from './psychometric-test-catalog.service';
import { CreatePsychometricTestCatalogDto } from './dto/create-psychometric-test-catalog.dto';
import { UpdatePsychometricTestCatalogDto } from './dto/update-psychometric-test-catalog.dto';
import { RequirePermission } from '../auth/require-permission.decorator';

@Controller('psychometric-test-catalog')
export class PsychometricTestCatalogController {
  constructor(
    private readonly psychometricTestCatalogService: PsychometricTestCatalogService,
  ) {}

  @Get()
  async findAll() {
    const psychometricTestCatalog =
      await this.psychometricTestCatalogService.findAll();
    return { psychometricTestCatalog };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const psychometricTest =
      await this.psychometricTestCatalogService.findOne(id);
    return { psychometricTest };
  }

  @Post()
  @RequirePermission('catalogs', 'create')
  async create(@Body() dto: CreatePsychometricTestCatalogDto) {
    const psychometricTest =
      await this.psychometricTestCatalogService.create(dto);
    return { psychometricTest };
  }

  @Patch(':id')
  @RequirePermission('catalogs', 'edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePsychometricTestCatalogDto,
  ) {
    const psychometricTest = await this.psychometricTestCatalogService.update(
      id,
      dto,
    );
    return { psychometricTest };
  }

  @Delete(':id')
  @RequirePermission('catalogs', 'delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const psychometricTest =
      await this.psychometricTestCatalogService.remove(id);
    return { psychometricTest };
  }
}
