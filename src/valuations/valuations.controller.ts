import { Body, Controller, Post, NotFoundException, BadRequestException } from '@nestjs/common';
import { ValuationsService } from './valuations.service';

class ValuationRequestDto {
  vehicleId?: string;
  vin?: string;
}

@Controller('valuations')
export class ValuationsController {
  constructor(private svc: ValuationsService) {}

  @Post()
  async value(@Body() body: ValuationRequestDto) {
    try {
      if (body.vehicleId) return this.svc.valueVehicleByVehicle(body.vehicleId as string);
      if (body.vin) return this.svc.valueByVin(body.vin as string);
      throw new BadRequestException('vehicleId or vin required');
    } catch (err) {
      if (err.message === 'VIN not found' || err.message === 'VIN not found and external lookup failed') {
        throw new NotFoundException(`Vehicle with VIN ${body.vin} not found`);
      }
      if (err.message === 'Vehicle has no VIN number') {
        throw new BadRequestException('Cannot value a vehicle without a VIN number');
      }
      if (err.message === 'Could not retrieve valuation for vehicle') {
        throw new NotFoundException('Could not get valuation from external service');
      }
      throw err;
    }
  }
}
