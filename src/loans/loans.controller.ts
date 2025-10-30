import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LoansService } from './loans.service';

class LoanApplyDto {
  applicantName: string;
  applicantIncome: number;
  applicantMonthlyDebt: number;
  amountRequested: number;
  termMonths: number;
  interestRate?: number;
  vehicle?: string; // vehicle id
}

@Controller('loans')
export class LoansController {
  constructor(private svc: LoansService) {}

  @Post()
  async apply(@Body() body: LoanApplyDto) {
    return this.svc.apply(body as any);
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
