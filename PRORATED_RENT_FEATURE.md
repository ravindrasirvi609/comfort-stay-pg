# Prorated Rent Calculation Feature

## Overview

The Prorated Rent Calculation feature automatically calculates rent based on the user's check-in date. When a user checks in mid-month, they only pay for the days they actually stay, rather than the full month's rent. This feature also tracks cumulative dues from previous unpaid months.

## Key Features

### 1. Prorated Rent Calculation

- **Automatic Calculation**: When a user checks in mid-month, rent is calculated proportionally
- **Daily Rate Formula**: `Daily Rate = Monthly Rent ÷ Days in Month`
- **Prorated Amount**: `Daily Rate × Days Remaining in Month` (including check-in day)
- **Rounding**: Keeps actual amount with 2 decimal places for precise calculations

### 2. Cumulative Due Tracking

- **Previous Unpaid Dues**: Automatically carried forward from previous months
- **Total Due Amount**: Current month prorated + Previous unpaid amounts
- **Payment Allocation**: Payments are applied against total due amount
- **Due Status Tracking**: Paid, Unpaid, Partial, Overdue statuses

### 3. Enhanced Due Management

- **Due Records**: Separate model to track monthly dues with detailed information
- **Automatic Updates**: Due amounts update automatically when payments are made
- **Bulk Operations**: Generate dues for all users in a single operation
- **Migration Support**: Convert existing users to new prorated system

## Database Schema

### UserDue Model

```typescript
{
  userId: ObjectId,           // Reference to User
  month: string,             // "January 2025"
  year: number,              // 2025
  monthNumber: number,       // 1-12

  // Rent calculation
  fullMonthRent: number,     // Original room price
  proratedRent: number,      // Calculated prorated amount
  daysCovered: number,       // Days in month covered
  totalDaysInMonth: number,  // Total days in the month

  // Due tracking
  totalDue: number,          // Current + Previous unpaid
  currentMonthDue: number,   // Only current month amount
  previousUnpaidDue: number, // Accumulated from previous months

  // Payment tracking
  totalPaid: number,         // Total amount paid
  remainingDue: number,      // Outstanding amount

  // Status and metadata
  dueStatus: string,         // "Paid" | "Partial" | "Unpaid" | "Overdue"
  dueDate: Date,            // When payment is due
  checkInDate: Date,        // If prorated
  isProrated: boolean,      // Whether rent is prorated
  isActive: boolean         // Soft delete flag
}
```

## API Endpoints

### 1. User Dues Management

- `GET /api/user-dues` - Get all user dues with filtering
- `POST /api/user-dues` - Create or update user dues
- `PUT /api/user-dues` - Bulk generate dues for all users
- `GET /api/user-dues/[id]` - Get specific due record
- `PUT /api/user-dues/[id]` - Update specific due record
- `DELETE /api/user-dues/[id]` - Soft delete due record

### 2. Due Recalculation

- `POST /api/user-dues/recalculate` - Recalculate dues for user(s)
- `GET /api/user-dues/recalculate` - Get recalculation statistics

### 3. Enhanced User Data

- `GET /api/users/with-dues` - Get users with enhanced due information

## Usage Examples

### Example 1: Mid-Month Check-in

```typescript
// User checks in on January 16, 2025
// Room rent: ₹8,000/month
// January has 31 days

const checkInDate = new Date(2025, 0, 16); // January 16
const result = calculateProratedRent(8000, checkInDate, 1, 2025);

console.log(result);
// {
//   fullMonthRent: 8000,
//   proratedRent: 4129,        // ₹8000/31 * 16 days
//   daysCovered: 16,           // 16th to 31st
//   totalDaysInMonth: 31,
//   isProrated: true,
//   dailyRate: 258.06
// }
```

### Example 2: Cumulative Dues

```typescript
// User has ₹2,000 unpaid from previous months
// Current month prorated rent: ₹4,129
// User paid ₹3,000

const dueCalc = calculateTotalDue(4129, 2000, 3000);

console.log(dueCalc);
// {
//   currentMonthDue: 4129,
//   previousUnpaidDue: 2000,
//   totalDue: 6129,           // 4129 + 2000
//   totalPaid: 3000,
//   remainingDue: 3129,       // 6129 - 3000
//   dueStatus: "Partial"
// }
```

## Implementation Guide

### Step 1: Generate Dues for Existing Users

```bash
# Generate dues for current month
npx ts-node src/scripts/generateDues.ts

# Generate dues for specific month
npx ts-node src/scripts/generateDues.ts 2 2025  # February 2025

# Force recalculation
npx ts-node src/scripts/generateDues.ts --force
```

### Step 2: Update Payment Processing

The payment creation API automatically updates due records when payments are made:

```typescript
// When creating a payment, dues are automatically recalculated
const payment = await Payment.create({
  userId: "user123",
  amount: 5000,
  months: ["January 2025"],
  paymentStatus: "Paid",
});

// Due record is automatically updated with new payment information
```

### Step 3: Display Enhanced Due Information

Use the new components to display enhanced due information:

```jsx
import { DueDisplay, DuesSummary } from '@/components/DueDisplay';

// Display individual user dues
<DueDisplay user={user} showDetails={true} />

// Display summary statistics
<DuesSummary users={users} />
```

## User Interface Components

### 1. DueDisplay Component

- Shows individual user due amounts
- Displays prorated information
- Shows breakdown of current vs previous dues
- Indicates prorated status

### 2. DuesSummary Component

- Overall payment statistics
- Total outstanding amounts
- Count of paid/unpaid users
- Previous unpaid amounts summary

### 3. DueManagement Component

- Admin interface for due management
- Bulk due generation
- Statistics and summaries
- Recalculation tools

## Benefits

### For Users

1. **Fair Billing**: Pay only for days actually stayed
2. **Transparent Calculation**: Clear breakdown of due amounts
3. **Cumulative Tracking**: See all outstanding amounts in one place
4. **Flexible Payment**: Partial payments are properly tracked

### For Administrators

1. **Automated Calculation**: No manual prorating needed
2. **Accurate Tracking**: Comprehensive due management
3. **Better Reports**: Enhanced payment analytics
4. **Reduced Disputes**: Clear, transparent calculations

### For Business

1. **Improved Cash Flow**: More accurate billing
2. **Reduced Manual Work**: Automated calculations
3. **Better Customer Satisfaction**: Fair billing practices
4. **Comprehensive Reporting**: Enhanced financial insights

## Migration Notes

### Existing Users

- Run the migration script to generate due records for existing users
- Existing payment data is preserved and integrated
- Legacy due calculations remain as fallback

### Data Integrity

- All calculations include proper validation
- Error handling for edge cases
- Comprehensive logging for troubleshooting

### Performance

- Efficient database queries with proper indexing
- Bulk operations for large user bases
- Caching for frequently accessed data

## Troubleshooting

### Common Issues

1. **Missing Due Records**

   - Run the generation script for the specific month
   - Check if user has an assigned room
   - Verify user is active

2. **Incorrect Prorated Amounts**

   - Verify check-in date is correct
   - Check room rent amount
   - Ensure month/year parameters are correct

3. **Payment Not Reflecting in Dues**
   - Check if payment month matches due month
   - Verify payment status is "Paid"
   - Run recalculation for the user

### Debug Commands

```bash
# Test prorated calculations
npx ts-node src/scripts/testProratedRent.ts

# Recalculate specific user
curl -X POST /api/user-dues/recalculate \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'

# Get due statistics
curl /api/user-dues/recalculate
```

## Future Enhancements

1. **Advanced Proration Rules**: Different rules for different room types
2. **Seasonal Pricing**: Support for seasonal rent variations
3. **Grace Periods**: Configurable grace periods for late payments
4. **Automated Reminders**: Smart reminder system based on due amounts
5. **Payment Plans**: Support for installment payments
6. **Mobile Notifications**: Push notifications for due amounts
7. **Integration**: Connect with external payment gateways
8. **Reports**: Advanced analytics and reporting features

## Support

For questions or issues with the prorated rent feature, please check:

1. This documentation
2. API endpoint documentation
3. Test scripts and examples
4. Database schema reference

The feature is designed to be robust and handle various edge cases, but always test with your specific use case before deploying to production.
