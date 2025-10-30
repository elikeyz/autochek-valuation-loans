import { Controller, Get, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';

@Controller('offers')
export class OffersController {
  constructor(@InjectRepository(Offer) private repo: Repository<Offer>) {}

  @Get()
  async list(@Query('loanId') loanId?: string) {
    if (loanId) return this.repo.find({ where: { loan: { id: loanId } } });
    return this.repo.find();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
