import { Body, Controller, Post, NotFoundException, BadRequestException, Get } from '@nestjs/common';
import { ValuationsService } from './valuations.service';
import { ValuationRequestDto } from './valuations.dto';

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

  @Get()
  async listAll() {
    return this.svc.findAll();
  }
}
