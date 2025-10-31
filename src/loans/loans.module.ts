import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { ValuationsModule } from '../valuations/valuations.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { OffersModule } from '../offers/offers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]),
    ValuationsModule,
    VehiclesModule,
    OffersModule
  ],
  providers: [LoansService],
  controllers: [LoansController],
  exports: [LoansService],
})
export class LoansModule {}
