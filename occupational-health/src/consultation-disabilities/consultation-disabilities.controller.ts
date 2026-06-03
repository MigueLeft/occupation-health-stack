import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConsultationDisabilitiesService } from './consultation-disabilities.service';
import { AddConsultationDisabilityDto } from './dto/add-consultation-disability.dto';

@Controller('consultation-disabilities')
export class ConsultationDisabilitiesController {
  constructor(
    private readonly consultationDisabilitiesService: ConsultationDisabilitiesService,
  ) {}

  @Get()
  async find(
    @Query('consultationId') consultationId?: string,
    @Query('patientCedula') patientCedula?: string,
  ) {
    if (patientCedula) {
      const disabilities =
        await this.consultationDisabilitiesService.findByPatient(patientCedula);
      return { disabilities };
    }
    if (consultationId) {
      const consultationDisabilities =
        await this.consultationDisabilitiesService.findByConsultation(
          consultationId,
        );
      return { consultationDisabilities };
    }
    return { consultationDisabilities: [] };
  }

  @Post()
  async add(@Body() dto: AddConsultationDisabilityDto) {
    const consultationDisability =
      await this.consultationDisabilitiesService.add(dto);
    return { consultationDisability };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.consultationDisabilitiesService.remove(id);
    return {};
  }
}
