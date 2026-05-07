import { Module } from '@nestjs/common';
import { MedicalSpecialtiesController } from './medical-specialties.controller';
import { MedicalSpecialtiesService } from './medical-specialties.service';

@Module({
  controllers: [MedicalSpecialtiesController],
  providers: [MedicalSpecialtiesService],
})
export class MedicalSpecialtiesModule {}
