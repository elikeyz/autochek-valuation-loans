import { Body, Controller, Get, Param, Patch, Post, NotFoundException, BadRequestException } from '@nestjs/common';
import { LoansService } from './loans.service';

import { IsString, IsNumber, IsOptional } from 'class-validator';

class LoanApplyDto {
  @IsString()
  applicantName: string;

  @IsNumber()
  applicantIncome: number;

  @IsNumber()
  applicantMonthlyDebt: number;

  @IsNumber()
  amountRequested: number;

  @IsNumber()
  termMonths: number;

  @IsNumber()
  @IsOptional()
  interestRate: number = 0.12; // Default 12% APR

  @IsString()
  @IsOptional()
  vehicle?: string;
}

@Controller('loans')
export class LoansController {
  constructor(private svc: LoansService) {}

  @Post()
  async apply(@Body() body: LoanApplyDto) {
    try {
      return await this.svc.apply(body as any);
    } catch (err) {
      if (err.message.includes('Vehicle with ID')) {
        throw new NotFoundException(err.message);
      }
      if (err.message === 'Failed to obtain vehicle valuation') {
        throw new BadRequestException('Could not obtain vehicle valuation');
      }
      throw err;
    }
  }

  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateStatus(id, status);
  }
}
