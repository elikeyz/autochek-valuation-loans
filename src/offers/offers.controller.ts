import { Controller, Get, Param, Query } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './offer.entity';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async list(@Query('loanId') loanId?: string): Promise<Offer[]> {
    if (loanId) return this.offersService.findByLoanId(loanId);
    return this.offersService.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<Offer> {
    return this.offersService.findOne(id);
  }
}
