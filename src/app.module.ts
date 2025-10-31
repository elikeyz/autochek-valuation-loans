import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ValuationsModule } from './valuations/valuations.module';
import { LoansModule } from './loans/loans.module';
import { OffersModule } from './offers/offers.module';
import { Vehicle } from './vehicles/vehicle.entity';
import { Valuation } from './valuations/valuation.entity';
import { Loan } from './loans/loan.entity';
import { Offer } from './offers/offer.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Vehicle, Valuation, Loan, Offer],
      synchronize: true,
      logging: true,
      logger: 'advanced-console',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VehiclesModule,
    ValuationsModule,
    LoansModule,
    OffersModule,
  ],
})
export class AppModule {}
