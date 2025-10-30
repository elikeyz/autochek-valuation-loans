import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsOptional()
  vin?: string;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsNumber()
  mileage: number;
}