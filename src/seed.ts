import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VehiclesService } from './vehicles/vehicles.service';
import { ValuationsService } from './valuations/valuations.service';
import { LoansService } from './loans/loans.service';
import { Loan } from './loans/loan.entity';
import { CreateVehicleDto } from './vehicles/vehicles.dto';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const vehicles = app.get(VehiclesService);
  const valuations = app.get(ValuationsService);
  const loans = app.get(LoansService);

  console.log('Seeding sample data...');

  const vehicleData: CreateVehicleDto[] = [
    { vin: '5FRYD4H66GB592800', make: 'Acura', model: 'MDX', year: 2016, mileage: 0 },
    { vin: '1FTFW1ET4EFA00001', make: 'Ford', model: 'F-150', year: 2018, mileage: 60000 }
  ];

  const [v1, v2] = await Promise.all(vehicleData.map(d => vehicles.create(d)));

  // Verify vehicles were saved
  const savedVehicles = await vehicles.findAll();
  console.log('Vehicles in database:', savedVehicles.length);
  console.log('Vehicle details:', savedVehicles.map(v => ({ id: v.id, make: v.make, model: v.model })));

  const [val1, val2] = await Promise.all([
    valuations.valueVehicleById(v1.id),
    valuations.valueVehicleById(v2.id)
  ]);

  // Verify valuations were saved
  const savedValuations = await valuations.findAll();
  console.log('Valuations in database:', savedValuations.length);
  console.log('Valuation details:', savedValuations.map(v => ({
    id: v.id,
    vehicleId: v.vehicle?.id,
    value: v.estimatedValue
  })));

  console.log('Attempting to create loan...');
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

  // Verify loan was saved
  const savedLoan = await loans.findOne(loan.id);
  console.log('Loan creation result:', {
    created: !!loan,
    savedInDb: !!savedLoan,
    id: loan.id,
    status: loan.status,
    offers: loan.offers?.length || 0,
    amount: loan.amountRequested,
    vehicleId: loan.vehicle?.id,
    valuationId: loan.valuation?.id
  });

  // Verify all loans in database
  const allLoans = await loans.findAll();
  console.log('Total loans in database:', allLoans.length);
  console.log('All loans:', allLoans.map(l => ({
    id: l.id,
    status: l.status,
    amount: l.amountRequested,
    offers: l.offers?.length || 0
  })));

  await app.close();
  console.log('Seeding done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
