import { Body, Controller, Post, NotFoundException, BadRequestException } from '@nestjs/common';
import { ValuationsService } from './valuations.service';

import { IsString, IsOptional } from 'class-validator';

class ValuationRequestDto {
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  vin?: string;
}

@Controller('valuations')
export class ValuationsController {
  constructor(private svc: ValuationsService) {}

  @Post()
  async value(@Body() body: ValuationRequestDto) {
    try {
      if (body.vehicleId) {
        return await this.svc.valueVehicleById(body.vehicleId as string);
      }
      if (body.vin) {
        return await this.svc.valueByVin(body.vin as string);
      }
      throw new BadRequestException('vehicleId or vin required');
    } catch (err) {
      if (err.message.includes('not found')) {
        throw new NotFoundException(`Vehicle with VIN ${body.vin} not found`);
      }
      if (err.message === 'Could not retrieve valuation for vehicle') {
        throw new NotFoundException('Could not get valuation from external service');
      }
      if (err.message.includes('Vehicle with ID')) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }
}
