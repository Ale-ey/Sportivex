# Gym Registration Module Implementation

## Overview
This document describes the implementation of the gym registration system with monthly payment requirements. Users must register and pay a monthly fee of 2000 PKR to access gym facilities, including workout tracking and QR code attendance.

## Database Schema

### Tables Created

1. **gym_registrations**
   - Tracks user gym registrations
   - Stores payment information and status
   - Tracks monthly payment due dates (8th of each month)
   - Fields: `user_id`, `monthly_fee` (default 2000), `payment_status`, `status`, `next_payment_date`, `payment_due`

2. **gym_monthly_payments**
   - Tracks monthly payment history
   - Links to registration via `registration_id`
   - Stores Stripe payment information

3. **gym_attendance**
   - Tracks QR code attendance scans
   - One entry per user per day
   - Requires active registration

4. **gym_qr_codes**
   - Manages gym QR codes for attendance
   - Default code: `GYM-ENTRANCE-001`

## Backend Implementation

### Service Functions (`gymService.js`)

- `getUserGymRegistration(userId)` - Get user's registration
- `checkGymRegistrationStatus(userId)` - Check if registration is active
- `createGymRegistration(registrationData)` - Create new registration
- `updateGymRegistration(registrationId, updateData)` - Update registration
- `createGymMonthlyPayment(paymentData)` - Create monthly payment record
- `updateGymMonthlyPayment(paymentId, paymentData)` - Update payment status
- `getUserGymMonthlyPayments(userId, limit)` - Get payment history
- `processGymQRScan(qrCodeValue, user)` - Process QR code attendance
- `getUserGymAttendance(userId, limit)` - Get attendance history

### Controller Functions (`gymController.js`)

- `getGymRegistrationController` - GET `/api/gym/registration`
- `checkGymRegistrationStatusController` - GET `/api/gym/registration/status`
- `createGymRegistrationController` - POST `/api/gym/registration`
- `verifyGymRegistrationPaymentController` - POST `/api/gym/registration/verify-payment`
- `createGymMonthlyPaymentController` - POST `/api/gym/registration/monthly-payment`
- `verifyGymMonthlyPaymentController` - POST `/api/gym/registration/monthly-payment/verify`
- `getGymMonthlyPaymentsController` - GET `/api/gym/registration/monthly-payments`
- `processGymQRScanController` - POST `/api/gym/attendance/scan-qr`
- `getGymAttendanceController` - GET `/api/gym/attendance`

### Routes (`gym.js`)

All workout and attendance routes are protected by `requireGymRegistration` middleware:
- Workout routes require active registration
- Attendance/QR scan routes require active registration
- Progress and stats routes require active registration
- Goals routes require active registration

Registration routes are public (no registration required):
- `/registration` - Get/create registration
- `/registration/status` - Check status
- `/registration/monthly-payment` - Create monthly payment

### Stripe Integration (`stripeService.js`)

- `createGymRegistrationCheckoutSession()` - Create checkout for registration
- `createGymMonthlyPaymentCheckoutSession()` - Create checkout for monthly payment

## Frontend Implementation

### Service (`gymService.ts`)

All registration and payment functions are available:
- `getRegistration()` - Get user registration
- `checkRegistrationStatus()` - Check status
- `createRegistration()` - Create registration
- `verifyRegistrationPayment()` - Verify payment
- `createMonthlyPayment()` - Create monthly payment
- `verifyMonthlyPayment()` - Verify monthly payment
- `getMonthlyPayments()` - Get payment history
- `scanQRCode()` - Scan QR for attendance
- `getAttendance()` - Get attendance history

## Payment Flow

1. **Initial Registration**
   - User creates registration (POST `/api/gym/registration`)
   - Backend creates Stripe checkout session
   - User redirected to Stripe payment page
   - After payment, verify via `/api/gym/registration/verify-payment`
   - Registration status set to `active`

2. **Monthly Payment**
   - Payment due on 8th of each month
   - User creates monthly payment (POST `/api/gym/registration/monthly-payment`)
   - Backend creates Stripe checkout session
   - User redirected to Stripe payment page
   - After payment, verify via `/api/gym/registration/monthly-payment/verify`
   - Registration updated with next payment date

## Access Control

- **Without Registration**: Users can view exercises but cannot:
  - Start/save workouts
  - View progress/stats
  - Set goals
  - Scan QR codes for attendance

- **With Active Registration**: Full access to all gym features

- **Payment Due**: Registration exists but payment is overdue:
  - Access blocked until payment is completed
  - Error message: "Monthly payment is due. Please pay to continue using gym facilities."

## QR Code Attendance

- QR code value must exist in `gym_qr_codes` table
- User must have active registration
- One check-in per day per user
- Check-in method: `qr_scan`
- Attendance stored in `gym_attendance` table

## Migration

Run the migration file:
```sql
\i backend/database/migrations/gym_registration_module.sql
```

## Environment Variables

Ensure Stripe is configured:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `FRONTEND_URL` - Frontend URL for payment redirects (default: http://localhost:5173)

## Testing

1. Create registration
2. Complete payment via Stripe
3. Verify registration is active
4. Test workout creation (should work)
5. Test QR code scan (should work)
6. Wait for payment due date
7. Test access (should be blocked)
8. Complete monthly payment
9. Verify access restored

## Notes

- Monthly fee: 2000 PKR (configurable in database)
- Payment due date: 8th of each month
- Registration expires if not paid within 24 hours (for initial registration)
- Payment status checked on every protected route access

