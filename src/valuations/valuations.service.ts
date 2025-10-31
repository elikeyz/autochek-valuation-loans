import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Valuation } from './valuation.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import axios from 'axios';

@Injectable()
export class ValuationsService {
  private readonly logger = new Logger(ValuationsService.name);

  constructor(
    @InjectRepository(Valuation) private repo: Repository<Valuation>,
    private vehicles: VehiclesService,
  ) {}

  async externalVinLookup(vin: string) {
    const key = process.env.RAPIDAPI_KEY;
    if (!key) return null;
    try {
      const resp = await axios.get('https://vin-lookup2.p.rapidapi.com/vehicle-lookup', {
        params: { vin },
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'vin-lookup2.p.rapidapi.com',
        },
      });

      // Check if response is empty
      if (!resp.data || Object.keys(resp.data).length === 0) {
        throw new Error('Empty response from VIN lookup');
      }

      return {
        estimatedValue: resp.data.retail_value || resp.data.trade_in_value || null,
        source: 'rapidapi',
        vehicleInfo: {
          make: resp.data.make,
          model: resp.data.model,
          year: resp.data.year,
          trim: resp.data.trim
        }
      };
    } catch (err) {
      if (err.message === 'Empty response from VIN lookup') {
        throw new Error('VIN not found');
      }
      this.logger.warn('External VIN lookup failed, falling back to simulation');
      return null;
    }
  }

  async findAll() {
    return this.repo.find({
      relations: ['vehicle']
    });
  }

  async valueVehicleByVehicle(vehicleId: string) {
    const vehicle = await this.vehicles.findOne(vehicleId);
    if (!vehicle.vin) {
      throw new Error('Vehicle has no VIN number');
    }
    const res = await this.externalVinLookup(vehicle.vin);
    if (!res) {
      throw new Error('Could not retrieve valuation for vehicle');
    }
    const record = this.repo.create({ vehicle, estimatedValue: res.estimatedValue, source: res.source });
    return this.repo.save(record);
  }

  async valueByVin(vin: string) {
    let vehicle = await this.vehicles.findByVin(vin);
    
    if (!vehicle) {
      // Try to get vehicle info from VIN lookup first
      const lookup = await this.externalVinLookup(vin);
      if (!lookup) {
        throw new Error('VIN not found and external lookup failed');
      }

      // Create vehicle with info from VIN lookup
      vehicle = await this.vehicles.create({
        vin,
        make: lookup.vehicleInfo.make,
        model: lookup.vehicleInfo.model,
        year: lookup.vehicleInfo.year,
        mileage: 0 // Since mileage isn't provided in the VIN lookup
      });

      // Create valuation directly since we already have the value
      const record = this.repo.create({
        vehicle,
        estimatedValue: lookup.estimatedValue,
        source: lookup.source
      });
      return this.repo.save(record);
    }

    return this.valueVehicleByVehicle(vehicle.id);
  }
}
