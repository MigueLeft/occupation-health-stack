import { Module } from '@nestjs/common';
import { DiseaseCategoriesController } from './disease-categories.controller';
import { DiseaseCategoriesService } from './disease-categories.service';

@Module({
  controllers: [DiseaseCategoriesController],
  providers: [DiseaseCategoriesService],
})
export class DiseaseCategoriesModule {}
