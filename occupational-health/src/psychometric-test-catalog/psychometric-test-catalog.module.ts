import { Module } from '@nestjs/common';
import { PsychometricTestCatalogController } from './psychometric-test-catalog.controller';
import { PsychometricTestCatalogService } from './psychometric-test-catalog.service';

@Module({
  controllers: [PsychometricTestCatalogController],
  providers: [PsychometricTestCatalogService],
})
export class PsychometricTestCatalogModule {}
