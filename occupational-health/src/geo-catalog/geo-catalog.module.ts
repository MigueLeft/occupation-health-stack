import { Module } from '@nestjs/common';
import { GeoCatalogController } from './geo-catalog.controller';
import { GeoCatalogService } from './geo-catalog.service';

@Module({
  controllers: [GeoCatalogController],
  providers: [GeoCatalogService],
})
export class GeoCatalogModule {}
