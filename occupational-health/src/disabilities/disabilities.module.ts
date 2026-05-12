import { Module } from '@nestjs/common';
import { DisabilitiesController } from './disabilities.controller';
import { DisabilitiesService } from './disabilities.service';

@Module({
  controllers: [DisabilitiesController],
  providers: [DisabilitiesService],
})
export class DisabilitiesModule {}
