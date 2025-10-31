import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { Vehicle } from '../vehicles/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, Vehicle]),
    VehiclesModule,
  ],
  providers: [OffersService],
  controllers: [OffersController],
  exports: [OffersService],
})
export class OffersModule {}
