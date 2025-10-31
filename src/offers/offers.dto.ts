import { IsString, IsNumber, IsPositive, Min, Max } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @Min(12)
  @Max(84)
  termMonths: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  apr: number;
}
