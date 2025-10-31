# Autochek Vehicle Valuation & Loan API (NestJS)

This is a small NestJS backend that demonstrates vehicle ingestion, valuation (simulated or via RapidAPI VIN lookup), offer management, and loan application processing with manual review workflow.

## Features

- Vehicle ingestion (VIN, make, model, year, mileage)
- Valuation requests (simulated by default; can call external VIN API if RAPIDAPI_KEY is set)
- Offer creation and management for vehicles with custom terms
- Loan application submission against existing offers
- Manual loan review workflow with approval/rejection and notes
- In-memory sqlite database (TypeORM) — runs as-is

## Getting started

1. Install dependencies

```bash
cd /Users/macbookpro/Projects/autochek
npm install
```

2. Optional: set RAPIDAPI_KEY environment variable to enable external VIN lookup (not required)

3. Run the app (development mode):

```bash
npm run start:dev
```

4. Seed sample data (creates vehicles, valuations, and one loan):

```bash
npm run seed
```

## API Endpoints

### Vehicles & Valuations

- `POST /vehicles` — Create a vehicle { vin?, make, model, year, mileage }
- `GET /vehicles` — List vehicles
- `GET /vehicles/:id` — Get vehicle details
- `POST /valuations` — Request valuation by { vehicleId } or { vin }

### Offers

- `POST /offers` — Create an offer { vehicleId, amount, termMonths, apr }
- `GET /offers` — List all offers (optional filters: ?vehicleId=, ?status=)
- `GET /offers/:id` — Get offer details
- `PUT /offers/:id/status` — Update offer status { status: 'active' | 'inactive' }

### Loan Applications

- `POST /loans` — Submit loan application { applicantName, applicantIncome, applicantMonthlyDebt, offerId }
- `GET /loans` — List loan applications
- `GET /loans/:id` — Get loan application details
- `PATCH /loans/:id/status` — Update application status { status: 'pending_review' | 'approved' | 'rejected', reviewNotes? }

## Business Flow

1. Admin creates offers for vehicles:
   - Set loan amount (up to 80% of vehicle value)
   - Define term length (12-84 months)
   - Set APR (interest rate)
   - Monthly payment is auto-calculated
   - Offers can be activated/deactivated

2. Loan Application Process:
   - Applicant selects an active offer
   - Provides income and existing debt information
   - System pre-checks debt-to-income ratio (DTI)
   - Application goes to manual review
   - Admin approves/rejects with notes

## Notes

- The valuation integration will attempt to call a RapidAPI VIN endpoint only if environment variable `RAPIDAPI_KEY` is provided. Otherwise it uses a local simulation.
- The database is a local sqlite DB file which gets generated when you run the app for the first time. Seed script populates sample data.
- Basic loan eligibility: Monthly payment + existing debt <= 40% of monthly income (DTI ratio)

## Security & Privacy

- This example uses ValidationPipe and Helmet for basic security headers
- Input validation on all endpoints with class-validator
- No authentication is implemented — do not deploy as-is for production
