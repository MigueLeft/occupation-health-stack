import { Module } from '@nestjs/common';
import { AccidentTypesController } from './accident-types.controller';
import { AccidentTypesService } from './accident-types.service';

@Module({
  controllers: [AccidentTypesController],
  providers: [AccidentTypesService],
})
export class AccidentTypesModule {}
