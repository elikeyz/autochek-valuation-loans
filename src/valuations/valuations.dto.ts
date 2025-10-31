import { IsString, IsOptional } from 'class-validator';

export class ValuationRequestDto {
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  vin?: string;
}
