import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

import { CreateVehicleDto } from './vehicles.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private svc: VehiclesService) {}

  @Post()
  async create(@Body() body: CreateVehicleDto) {
    return this.svc.create(body as any);
  }

  @Get()
  async list() {
    return this.svc.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
}
