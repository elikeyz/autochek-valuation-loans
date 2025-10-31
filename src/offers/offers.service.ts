import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectRepository(Offer) private repo: Repository<Offer>,
  ) {}

  async create(data: Partial<Offer>): Promise<Offer> {
    const offer = this.repo.create(data);
    return this.repo.save(offer);
  }

  async findOne(id: string): Promise<Offer> {
    return this.repo.findOne({ 
      where: { id },
      relations: { loan: true }
    });
  }

  async findAll(): Promise<Offer[]> {
    return this.repo.find({
      relations: { loan: true }
    });
  }

  async findByLoanId(loanId: string): Promise<Offer[]> {
    return this.repo.find({
      where: { loan: { id: loanId } },
      relations: { loan: true }
    });
  }

  async estimateMonthlyPayment(principal: number, months: number, annualInterest = 0.12): Promise<number> {
    if (!months || months <= 0) return principal;
    const monthlyRate = annualInterest / 12;
    const denom = 1 - Math.pow(1 + monthlyRate, -months);
    const payment = monthlyRate === 0 ? principal / months : principal * (monthlyRate / denom);
    return Math.round(payment * 100) / 100;
  }

  async generateOffer(loanId: string, amountRequested: number, termMonths: number, interestRate = 0.12): Promise<Offer> {
    const monthlyPayment = await this.estimateMonthlyPayment(amountRequested, termMonths, interestRate);
    const offer = this.repo.create({ 
      loan: { id: loanId },
      monthlyPayment, 
      apr: interestRate,
      source: 'generated'
    });
    return this.repo.save(offer);
  }
}