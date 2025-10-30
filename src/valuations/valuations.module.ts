import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Valuation } from './valuation.entity';
import { ValuationsService } from './valuations.service';
import { ValuationsController } from './valuations.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Valuation]), VehiclesModule],
  providers: [ValuationsService],
  controllers: [ValuationsController],
  exports: [ValuationsService],
})
export class ValuationsModule {}
