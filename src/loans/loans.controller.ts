import { Body, Controller, Get, Param, Patch, Post, NotFoundException, BadRequestException } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanStatus } from './loan.entity';
import { LoanApplyDto } from './loans.dto';

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
  async updateStatus(@Param('id') id: string, @Body('status') status: LoanStatus) {
    return this.svc.updateStatus(id, status);
  }
}
