import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectRepository(Offer) private repo: Repository<Offer>,
    @InjectRepository(Vehicle) private vehiclesRepo: Repository<Vehicle>,
  ) {}

  async create(data: { vehicleId: string; amount: number; termMonths: number; apr: number }): Promise<Offer> {
    this.logger.debug('Creating offer with data:', data);
    const vehicle = await this.vehiclesRepo.findOne({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundException(`Vehicle ${data.vehicleId} not found`);

    const offer = this.repo.create({
      vehicle,
      amount: data.amount,
      termMonths: data.termMonths,
      apr: data.apr,
      status: 'active',
      monthlyPayment: await this.estimateMonthlyPayment(data.amount, data.termMonths, data.apr),
    });

    return this.repo.save(offer);
  }

  async findOne(id: string): Promise<Offer | null> {
    this.logger.debug(`Fetching offer with id: ${id}`);
    return this.repo.findOne({
      where: { id },
      relations: {
        vehicle: {
          valuation: true
        }
      }
    });
  }

  async findAll(): Promise<Offer[]> {
    this.logger.debug('Fetching all offers');
    return this.repo.find({
      relations: {
        vehicle: {
          valuation: true
        }
      }
    });
  }

  async findByVehicle(vehicleId: string): Promise<Offer[]> {
    this.logger.debug(`Fetching offers for vehicle ID: ${vehicleId}`);
    return this.repo.find({
      where: { vehicle: { id: vehicleId } },
      relations: {
        vehicle: {
          valuation: true
        }
      }
    });
  }

  async findByStatus(status: 'active' | 'inactive'): Promise<Offer[]> {
    this.logger.debug(`Fetching offers with status: ${status}`);
    return this.repo.find({
      where: { status },
      relations: { vehicle: true }
    });
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<Offer | null> {
    this.logger.debug(`Updating status of offer ${id} to ${status}`);
    const offer = await this.findOne(id);
    if (!offer) {
      this.logger.warn(`Offer ${id} not found for status update`);
      return null;
    }

    offer.status = status;
    return this.repo.save(offer);
  }

  async estimateMonthlyPayment(principal: number, months: number, annualInterest: number): Promise<number> {
    this.logger.debug(`Estimating monthly payment for principal: ${principal}, months: ${months}, annualInterest: ${annualInterest}`);
    if (!months || months <= 0) return principal;
    const monthlyRate = annualInterest / 12;
    const denom = 1 - Math.pow(1 + monthlyRate, -months);
    const payment = monthlyRate === 0 ? principal / months : principal * (monthlyRate / denom);
    return Math.round(payment * 100) / 100;
  }
}
