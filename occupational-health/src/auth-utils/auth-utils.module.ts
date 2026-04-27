import { Module } from '@nestjs/common';
import { AuthUtilsController } from './auth-utils.controller';

@Module({
  controllers: [AuthUtilsController],
})
export class AuthUtilsModule {}
