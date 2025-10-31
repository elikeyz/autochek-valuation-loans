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
    this.logger.debug(`Performing external VIN lookup for VIN: ${vin}`);
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

      this.logger.debug(`Received response from VIN lookup for VIN ${vin}: ${JSON.stringify(resp.data)}`);

      // Check if response is empty
      if (!resp.data || Object.keys(resp.data).length === 0) return null;

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
      this.logger.warn('External VIN lookup failed, falling back to simulation');
      return null;
    }
  }

  async findAll() {
    this.logger.debug('Fetching all valuations');
    return this.repo.find({
      relations: ['vehicle']
    });
  }

  async findByVehicle(vehicleId: string) {
    this.logger.debug(`Fetching valuation for vehicle ID: ${vehicleId}`);
    return this.repo.findOne({
      where: { vehicle: { id: vehicleId } },
      relations: ['vehicle']
    });
  }

  async createOrUpdateValuation(data: Partial<Valuation>) {
    if (data.vehicle) {
      const existing = await this.findByVehicle(data.vehicle.id);
      if (existing) {
        this.logger.log(`Updating existing valuation for vehicle ${data.vehicle.id}`);
        Object.assign(existing, data);
        return this.repo.save(existing);
      }
    }

    this.logger.log(`Creating new valuation for vehicle ${data.vehicle?.id}`);
    const valuation = this.repo.create(data);
    return this.repo.save(valuation);
  }

  async valueVehicleById(vehicleId: string) {
    this.logger.debug(`Valuing vehicle by ID: ${vehicleId}`);
    const vehicle = await this.vehicles.findOne(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${vehicleId} not found`);
    }

    let valuationData;

    const res = await this.externalVinLookup(vehicle.vin)

    if (res) {
      valuationData = {
        estimatedValue: res.estimatedValue,
        source: res.source
      };
      this.logger.log(`Obtained valuation from external service for vehicle with VIN ${vehicle.vin}: $${res.estimatedValue}`);
    } else {
      const baseValue = 20000;
      const yearAdjustment = (vehicle.year - 2010) * 1000;
      const mileageAdjustment = -(vehicle.mileage || 0) * 0.02;

      valuationData = {
        estimatedValue: Math.max(5000, baseValue + yearAdjustment + mileageAdjustment),
        source: 'simulated'
      };
      this.logger.log(`Generated simulated valuation for existing vehicle with VIN ${vehicle.vin}: $${valuationData.estimatedValue}`);
    }

    return this.createOrUpdateValuation({
      vehicle,
      estimatedValue: valuationData.estimatedValue,
      source: valuationData.source
    });
  }

  async valueByVin(vin: string) {
    let vehicle = await this.vehicles.findByVin(vin);

    if (!vehicle) {
      const lookup = await this.externalVinLookup(vin);
      if (!lookup) {
        throw new Error(`Vehicle with VIN ${vin} not found in database or VIN lookup service`);
      }

      this.logger.log(`Creating new vehicle record for VIN ${vin} from VIN lookup data`);
      vehicle = await this.vehicles.create({
        vin,
        make: lookup.vehicleInfo.make,
        model: lookup.vehicleInfo.model,
        year: lookup.vehicleInfo.year,
        mileage: 0
      });

      return this.createOrUpdateValuation({
        vehicle,
        estimatedValue: lookup.estimatedValue,
        source: lookup.source
      });
    }

    return this.valueVehicleById(vehicle.id);
  }
}
