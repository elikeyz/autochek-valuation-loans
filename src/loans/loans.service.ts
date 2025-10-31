import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan, LoanStatus } from './loan.entity';
import { OffersService } from '../offers/offers.service';

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    @InjectRepository(Loan) private loansRepo: Repository<Loan>,
    private offers: OffersService,
  ) {}

  async apply(data: {
    applicantName: string;
    applicantIncome: number;
    applicantMonthlyDebt: number;
    offerId: string;
  }): Promise<Loan> {
    this.logger.debug('Processing loan application:', data);

    const offer = await this.offers.findOne(data.offerId);
    if (!offer) {
      this.logger.warn(`Offer ${data.offerId} not found`);
      throw new NotFoundException(`Offer ${data.offerId} not found`);
    }

    if (offer.status !== 'active') {
      this.logger.warn(`Offer ${data.offerId} is not active`);
      throw new BadRequestException(`Offer ${data.offerId} is not active`);
    }

    const loan = this.loansRepo.create({
      ...data,
      status: 'pending_review',
      offer: offer,
    });

    const saved = await this.loansRepo.save(loan);
    if (!saved) {
      this.logger.error('Failed to save loan application');
      throw new Error('Failed to save loan');
    }

    const eligible = this.checkEligibility(saved);
    if (!eligible) {
      saved.reviewNotes = 'Auto-check: Does not meet basic eligibility criteria';
    }

    this.logger.log(`Loan application processed with ID: ${saved.id}`);
    return this.loansRepo.save(saved);
  }

  async findOne(id: string) {
    this.logger.debug(`Fetching loan with id: ${id}`);
    const loan = await this.loansRepo.findOne({
      where: { id },
      relations: {
        offer: {
          vehicle: {
            valuation: true
          }
        }
      }
    });
    this.logger.log(`Loan ${id} found: ${!!loan}`);
    return loan;
  }

  checkEligibility(loan: Loan) {
    this.logger.debug(`Checking eligibility for loan ID: ${loan.id}`);
    // Basic rules:
    // - loan amount <= 80% of valuation
    // - monthlyPayment <= 0.4 * monthly income

    if (!loan.offer) {
      this.logger.warn(`Loan ID: ${loan.id} has no associated offer`);
      return false;
    }

    // Check debt-to-income ratio (monthly payment + existing debt vs income)
    const monthlyIncome = loan.applicantIncome / 12;
    const totalMonthlyDebt = loan.offer.monthlyPayment + (loan.applicantMonthlyDebt || 0);
    if (totalMonthlyDebt > monthlyIncome * 0.4) {
      this.logger.warn(`Loan ID: ${loan.id} exceeds debt-to-income ratio`);
      return false;
    }

    this.logger.log(`Loan ID: ${loan.id} meets eligibility criteria`);
    return true;
  }

  async updateStatus(id: string, status: LoanStatus, reviewNotes?: string) {
    this.logger.debug(`Updating status for loan ID: ${id} to ${status}`);
    const loan = await this.findOne(id);
    if (!loan) {
      this.logger.warn(`Loan ID: ${id} not found for status update`);
      return null;
    }

    loan.status = status;
    loan.reviewNotes = reviewNotes || loan.reviewNotes;
    loan.reviewedAt = new Date();

    return this.loansRepo.save(loan);
  }

  async findAll() {
    this.logger.debug('Fetching all loans from database');
    const loans = await this.loansRepo.find({
      relations: {
        offer: {
          vehicle: {
            valuation: true
          }
        }
      }
    });
    this.logger.log(`Found ${loans.length} loans in database`);
    return loans;
  }
}
