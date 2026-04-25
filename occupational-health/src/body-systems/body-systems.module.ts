import { Module } from '@nestjs/common';
import { BodySystemsController } from './body-systems.controller';
import { BodySystemsService } from './body-systems.service';

@Module({
  controllers: [BodySystemsController],
  providers: [BodySystemsService],
})
export class BodySystemsModule {}
