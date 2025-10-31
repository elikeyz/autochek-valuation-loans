import { Controller, Get, Post, Put, Body, Param, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './offer.entity';

import { IsString, IsNumber, IsPositive, Min, Max, IsEnum } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @Min(12)
  @Max(84)
  termMonths: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  apr: number;
}

export class UpdateOfferStatusDto {
  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive';
}

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(@Body() data: CreateOfferDto): Promise<Offer> {
    return this.offersService.create(data);
  }

  @Get()
  async list(@Query('vehicleId') vehicleId?: string, @Query('status') status?: 'active' | 'inactive'): Promise<Offer[]> {
    if (vehicleId) {
      return this.offersService.findByVehicle(vehicleId);
    }
    if (status) {
      return this.offersService.findByStatus(status);
    }
    return this.offersService.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<Offer> {
    const offer = await this.offersService.findOne(id);
    if (!offer) throw new NotFoundException(`Offer ${id} not found`);
    return offer;
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() data: UpdateOfferStatusDto): Promise<Offer> {
    const offer = await this.offersService.updateStatus(id, data.status);
    if (!offer) throw new NotFoundException(`Offer ${id} not found`);
    return offer;
  }
}
