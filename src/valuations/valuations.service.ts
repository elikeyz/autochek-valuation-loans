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

  async simulateValue(vehicle) {
    // Very simple simulation: base price by age and mileage
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - vehicle.year);
    const base = 30000; // baseline
    const yearFactor = Math.max(0.2, 1 - age * 0.05);
    const mileageFactor = Math.max(0.3, 1 - vehicle.mileage / 200000);
    const estimate = Math.round(base * yearFactor * mileageFactor);
    return { estimatedValue: estimate, source: 'simulated' };
  }

  async externalVinLookup(vin: string) {
    // If the env RAPIDAPI_KEY is set, attempt to call a VIN lookup; otherwise return null
    const key = process.env.RAPIDAPI_KEY;
    if (!key) return null;
    try {
      const resp = await axios.get('https://vindecoder.p.rapidapi.com/lookup', {
        params: { vin },
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': 'vindecoder.p.rapidapi.com',
        },
      });
      // This is illustrative. The free Jack Roe VIN API can be used similarly with correct URL.
      return { estimatedValue: resp.data?.estimatedValue || null, source: 'rapidapi' };
    } catch (err) {
      this.logger.warn('External VIN lookup failed, falling back to simulation');
      return null;
    }
  }

  async valueVehicleByVehicle(vehicleId: string) {
    const vehicle = await this.vehicles.findOne(vehicleId);
    // Try external by VIN if available
    let res = null;
    if (vehicle.vin) res = await this.externalVinLookup(vehicle.vin);
    if (!res) res = await this.simulateValue(vehicle);
    const record = this.repo.create({ vehicle, estimatedValue: res.estimatedValue, source: res.source });
    return this.repo.save(record);
  }

  async valueByVin(vin: string) {
    // If VIN maps to existing vehicle, use that otherwise create
    let vehicle = await this.vehicles.findByVin(vin);
    if (!vehicle) {
      // Minimal placeholder if missing — in practice require full data
      vehicle = await this.vehicles.create({ vin, make: 'Unknown', model: 'Unknown', year: new Date().getFullYear(), mileage: 0 });
    }
    return this.valueVehicleByVehicle(vehicle.id);
  }
}
