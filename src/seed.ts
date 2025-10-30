import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VehiclesService } from './vehicles/vehicles.service';
import { ValuationsService } from './valuations/valuations.service';
import { LoansService } from './loans/loans.service';
import { Vehicle } from './vehicles/vehicle.entity';
import { Loan } from './loans/loan.entity';
import { CreateVehicleDto } from './vehicles/vehicles.dto';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const vehicles = app.get(VehiclesService);
  const valuations = app.get(ValuationsService);
  const loans = app.get(LoansService);

  console.log('Seeding sample data...');

  const vehicleData: CreateVehicleDto[] = [
    { vin: '1HGCM82633A004352', make: 'Honda', model: 'Accord', year: 2015, mileage: 80000 },
    { vin: '1FTFW1ET4EFA00001', make: 'Ford', model: 'F-150', year: 2018, mileage: 60000 }
  ];

  const [v1, v2] = await Promise.all(vehicleData.map(d => vehicles.create(d)));

  const [val1, val2] = await Promise.all([
    valuations.valueVehicleByVehicle(v1.id),
    valuations.valueVehicleByVehicle(v2.id)
  ]);

  console.log('Created vehicles and valuations:', { 
    v1: v1.id, 
    val1: val1.estimatedValue, 
    v2: v2.id, 
    val2: val2.estimatedValue 
  });

  const loan = await loans.apply({
    applicantName: 'Alice',
    applicantIncome: 60000,
    applicantMonthlyDebt: 200,
    amountRequested: Math.round((val1.estimatedValue || 10000) * 0.6),
    termMonths: 36,
    interestRate: 0.12,
    vehicle: v1,
    valuation: val1
  } as Partial<Loan>);

  console.log('Created loan', loan.id, 'status', loan.status, 'offers', loan.offers?.length || 0);

  await app.close();
  console.log('Seeding done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
