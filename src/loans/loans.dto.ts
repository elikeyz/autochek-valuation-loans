import { IsString, IsNumber, IsPositive, Min } from 'class-validator';

export class LoanApplyDto {
  @IsString()
  applicantName: string;

  @IsNumber()
  @IsPositive()
  applicantIncome: number;

  @IsNumber()
  @Min(0)
  applicantMonthlyDebt: number;

  @IsString()
  offerId: string;
}
