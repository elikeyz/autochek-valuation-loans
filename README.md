# Autochek Vehicle Valuation & Loan API (NestJS)

This is a small NestJS backend that demonstrates vehicle ingestion, valuation (simulated or via RapidAPI VIN lookup), loan application processing, basic eligibility logic, and offers.

Features
- Vehicle ingestion (VIN, make, model, year, mileage)
- Valuation requests (simulated by default; can call external VIN API if RAPIDAPI_KEY is set)
- Loan application submission and status updates
- Offer generation for approved loans
- In-memory sqlite database (TypeORM) — runs as-is

Getting started

1. Install dependencies

```bash
cd /Users/macbookpro/Projects/autochek
npm install
```

2. Optional: set RAPIDAPI_KEY environment variable to enable external VIN lookup (not required)

3. Seed sample data (creates vehicles, valuations, and one loan):

```bash
npm run seed
```

4. Run the app (development mode):

```bash
npm run start:dev
```

API Endpoints
- POST /vehicles — create a vehicle { vin?, make, model, year, mileage }
- GET /vehicles/:id — get vehicle
- POST /valuations — request valuation by { vehicleId } or { vin }
- POST /loans — submit loan application (applicantName, applicantIncome, applicantMonthlyDebt, amountRequested, termMonths, interestRate?, vehicle)
- GET /loans/:id — get loan
- PATCH /loans/:id/status — update status { status }
- GET /offers — list offers (optional ?loanId=)
- GET /offers/:id — get offer

Notes
- The valuation integration will attempt to call a RapidAPI VIN endpoint only if environment variable `RAPIDAPI_KEY` is provided. Otherwise it uses a local simulation.
- The database is in-memory sqlite and resets when the app restarts. Seed script populates sample data.
- Basic loan eligibility: amountRequested <= 80% of valuation and monthly payment <= 40% of monthly income.

Security & Privacy
- This example uses ValidationPipe and Helmet for basic security headers. No authentication is implemented — do not deploy as-is for production.

Testing
- One basic Jest test exists for valuation simulation. Run `npm test`.
