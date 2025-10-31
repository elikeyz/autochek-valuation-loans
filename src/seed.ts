import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VehiclesService } from './vehicles/vehicles.service';
import { ValuationsService } from './valuations/valuations.service';
import { LoansService } from './loans/loans.service';
import { OffersService } from './offers/offers.service';
import { CreateVehicleDto } from './vehicles/vehicles.dto';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const vehicles = app.get(VehiclesService);
  const valuations = app.get(ValuationsService);
  const offers = app.get(OffersService);
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

  // Create an offer for the first vehicle
  console.log('Creating sample offer...');
  const offer = await offers.create({
    vehicleId: v1.id,
    amount: Math.round((val1.estimatedValue || 10000) * 0.8),
    termMonths: 36,
    apr: 0.0599, // 5.99% APR
  });

  console.log('Offer created:', {
    id: offer.id,
    vehicleId: offer.vehicle.id,
    amount: offer.amount,
    monthlyPayment: offer.monthlyPayment,
  });

  // Create a loan application for the offer
  console.log('Attempting to create loan...');
  const loan = await loans.apply({
    applicantName: 'Alice Smith',
    applicantIncome: 90000,
    applicantMonthlyDebt: 500,
    offerId: offer.id,
  });

  // Verify loan was saved
  const savedLoan = await loans.findOne(loan.id);
  console.log('Loan creation result:', {
    created: !!loan,
    savedInDb: !!savedLoan,
    id: loan.id,
    status: loan.status,
    offerId: loan.offer?.id,
    monthlyPayment: loan.offer?.monthlyPayment
  });

  // Verify all loans in database
  const allLoans = await loans.findAll();
  console.log('Total loans in database:', allLoans.length);
  console.log('All loans:', allLoans.map(l => ({
    id: l.id,
    status: l.status,
    applicant: l.applicantName,
    offerId: l.offer?.id
  })));

  // Create an offer for the second vehicle with different terms
  const offer2 = await offers.create({
    vehicleId: v2.id,
    amount: Math.round((val2.estimatedValue || 15000) * 0.7),
    termMonths: 48,
    apr: 0.0699, // 6.99% APR
  });

  console.log('Second offer created:', {
    id: offer2.id,
    vehicleId: offer2.vehicle.id,
    amount: offer2.amount,
    monthlyPayment: offer2.monthlyPayment,
  });

  await app.close();
  console.log('Seeding done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
