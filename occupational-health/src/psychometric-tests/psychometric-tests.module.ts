import { Module } from '@nestjs/common';
import { PsychometricTestsController } from './psychometric-tests.controller';
import { PsychometricTestsService } from './psychometric-tests.service';

@Module({
  controllers: [PsychometricTestsController],
  providers: [PsychometricTestsService],
})
export class PsychometricTestsModule {}
