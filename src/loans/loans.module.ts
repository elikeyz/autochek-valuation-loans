import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { Offer } from '../offers/offer.entity';
import { OffersController } from '../offers/offers.controller';
import { ValuationsModule } from '../valuations/valuations.module';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Offer]), ValuationsModule, VehiclesModule],
  providers: [LoansService],
  controllers: [LoansController, OffersController],
  exports: [LoansService],
})
export class LoansModule {}
