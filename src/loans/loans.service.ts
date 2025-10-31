import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './loan.entity';
import { ValuationsService } from '../valuations/valuations.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { OffersService } from '../offers/offers.service';

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    @InjectRepository(Loan) private loansRepo: Repository<Loan>,
    private valuations: ValuationsService,
    private vehicles: VehiclesService,
    private offers: OffersService,
  ) {}

  async apply(application: Partial<Loan>): Promise<Loan> {
    this.logger.debug('Processing loan application:', application);

    // Validate vehicle if given
    if (application.vehicle && typeof application.vehicle === 'string') {
      const vehicle = await this.vehicles.findOne(application.vehicle);
      if (!vehicle) {
        throw new Error(`Vehicle with ID ${application.vehicle} not found`);
      }
      application.vehicle = vehicle;
    }

    // Obtain valuation if not present
    if (!application.valuation && application.vehicle) {
      try {
        const val = await this.valuations.valueVehicleById((application.vehicle as any).id);
        application.valuation = val;
      } catch (err) {
        this.logger.error('Failed to get valuation:', err);
        application.valuation = await this.valuations.createOrUpdateValuation({
        vehicle: application.vehicle,
        estimatedValue: application.amountRequested * 1.25, // Rough estimation: loan amount + 25%
        source: 'estimated'
      });
      }
    }

    const loan = this.loansRepo.create({
      ...application,
      status: 'pending',
      interestRate: application.interestRate || 0.12,
    });
    const saved = await this.loansRepo.save(loan);
    if (!saved) throw new Error('Failed to save loan');

    // Run basic eligibility
    const eligible = this.checkEligibility(saved);
    if (eligible) {
      saved.status = 'approved';
      // create an offer
      const offer = await this.generateOffer(saved);
      saved.offers = [offer];
    } else {
      saved.status = 'rejected';
    }
    return this.loansRepo.save(saved);
  }

  async findOne(id: string) {
    const loan = await this.loansRepo.findOne({
      where: { id },
      relations: {
        vehicle: true,
        valuation: true,
        offers: true
      }
    });
    this.logger.log(`Loan ${id} found: ${!!loan}`);
    return loan;
  }

  checkEligibility(loan: Loan) {
    // Basic rules:
    // - loan amount <= 80% of valuation
    // - monthlyPayment <= 0.4 * monthly income
    const valuation = loan.valuation?.estimatedValue || 0;
    if (!valuation) return false;
    if (loan.amountRequested > valuation * 0.8) return false;

    // Calculate monthly payment
    const monthlyPayment = this.estimateMonthlyPayment(
      loan.amountRequested,
      loan.termMonths,
      loan.interestRate || 0.12
    );

    // Check debt-to-income ratio (monthly payment + existing debt vs income)
    const monthlyIncome = loan.applicantIncome / 12;
    const totalMonthlyDebt = monthlyPayment + (loan.applicantMonthlyDebt || 0);
    if (totalMonthlyDebt > monthlyIncome * 0.4) return false;

    return true;
  }

  estimateMonthlyPayment(principal: number, months: number, annualInterest = 0.12) {
    if (!months || months <= 0) return principal;
    const monthlyRate = annualInterest / 12;
    const denom = 1 - Math.pow(1 + monthlyRate, -months);
    const payment = monthlyRate === 0 ? principal / months : principal * (monthlyRate / denom);
    return Math.round(payment * 100) / 100;
  }

  async generateOffer(loan: Loan) {
    const apr = loan.interestRate || 0.12;
    return this.offers.generateOffer(loan.id, loan.amountRequested, loan.termMonths, apr);
  }

  async updateStatus(id: string, status: string) {
    const loan = await this.findOne(id);
    if (!loan) return null;
    loan.status = status as any;
    return this.loansRepo.save(loan);
  }

  async findAll() {
    const loans = await this.loansRepo.find({
      relations: {
        vehicle: true,
        valuation: true,
        offers: true
      }
    });
    this.logger.log(`Found ${loans.length} loans in database`);
    return loans;
  }
}
