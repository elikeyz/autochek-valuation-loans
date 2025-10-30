import { Body, Controller, Post } from '@nestjs/common';
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
    if (body.vehicleId) return this.svc.valueVehicleByVehicle(body.vehicleId as string);
    if (body.vin) return this.svc.valueByVin(body.vin as string);
    return { error: 'vehicleId or vin required' };
  }
}
