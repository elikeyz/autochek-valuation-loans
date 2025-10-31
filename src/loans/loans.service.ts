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

    // Get the offer
    const offer = await this.offers.findOne(data.offerId);
    if (!offer) {
      throw new NotFoundException(`Offer ${data.offerId} not found`);
    }

    if (offer.status !== 'active') {
      throw new BadRequestException(`Offer ${data.offerId} is not active`);
    }

    // Create loan application
    const loan = this.loansRepo.create({
      ...data,
      status: 'pending_review',
      offer: offer,
    });

    // Save initial application
    const saved = await this.loansRepo.save(loan);
    if (!saved) throw new Error('Failed to save loan');

    // Pre-check eligibility but leave final decision to manual review
    const eligible = this.checkEligibility(saved);
    if (!eligible) {
      saved.reviewNotes = 'Auto-check: Does not meet basic eligibility criteria';
    }

    return this.loansRepo.save(saved);
  }

  async findOne(id: string) {
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
    // Basic rules:
    // - loan amount <= 80% of valuation
    // - monthlyPayment <= 0.4 * monthly income

    // Check if we have an active offer
    if (!loan.offer) return false;

    // Check debt-to-income ratio (monthly payment + existing debt vs income)
    const monthlyIncome = loan.applicantIncome / 12;
    const totalMonthlyDebt = loan.offer.monthlyPayment + (loan.applicantMonthlyDebt || 0);
    if (totalMonthlyDebt > monthlyIncome * 0.4) return false;

    return true;
  }

  async updateStatus(id: string, status: LoanStatus, reviewNotes?: string) {
    const loan = await this.findOne(id);
    if (!loan) return null;

    loan.status = status;
    loan.reviewNotes = reviewNotes || loan.reviewNotes;
    loan.reviewedAt = new Date();

    return this.loansRepo.save(loan);
  }

  async findAll() {
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
