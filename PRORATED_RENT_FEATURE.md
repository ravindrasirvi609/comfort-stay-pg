# Prorated Rent & Credit Balance System

## Overview

The Prorated Rent & Credit Balance System provides comprehensive rent management with fair billing practices. When a user checks in mid-month, they only pay for the days they actually stay. The system also handles overpayments by maintaining a credit balance that can be automatically applied to future dues.

## Key Features

### 1. Prorated Rent Calculation

- **Automatic Calculation**: When a user checks in mid-month, rent is calculated proportionally
- **Daily Rate Formula**: `Daily Rate = Monthly Rent ÷ Days in Month`
- **Prorated Amount**: `Daily Rate × Days Remaining in Month` (including check-in day)
- **Precision**: Maintains 2 decimal places for accurate calculations

### 2. Credit Balance System

- **Overpayment Handling**: Excess payments create credit balance for future months
- **Automatic Application**: Credits are automatically applied to reduce future dues
- **Cross-Month Credit**: Overpayments from one month carry forward to subsequent months
- **Transparent Tracking**: Credit usage and remaining balance are clearly tracked

### 3. Cumulative Due Tracking

- **Previous Unpaid Dues**: Automatically carried forward from previous months
- **Total Due Amount**: Current month prorated + Previous unpaid - Available credit
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

  // Credit system (NEW)
  creditBalance: number,     // Available credit from overpayments
  creditUsed: number,        // Credit applied to this month's dues
  netDue: number,           // Final amount due after credit application

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

## Credit Management Utilities

The system includes several utility functions for credit management:

### Core Credit Functions

```typescript
// Get user's available credit
const credit = await getUserAvailableCredit(userId, year, month, UserDue);

// Format credit for display
const displayText = formatCreditDisplay(1500.5); // "₹1,500.50 credit"

// Calculate credit summary for multiple users
const summary = calculateCreditSummary([
  { creditBalance: 1000, netDue: -500 },
  { creditBalance: 0, netDue: 2000 },
]);
// Returns: { totalCredit: 1500, usersWithCredit: 2, averageCredit: 750 }
```

### Integration with Payment Processing

When processing payments, the system:

1. **Calculates Available Credit**: Retrieves previous credit balance
2. **Applies Credit**: Reduces current dues by available credit
3. **Handles Overpayments**: Creates new credit from excess payments
4. **Updates Records**: Maintains accurate credit and due balances

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

### Example 3: Credit Balance System (NEW)

```typescript
// User has ₹500 available credit from previous overpayments
// Current month prorated rent: ₹4,129
// Previous unpaid: ₹1,000
// User paid ₹6,000

const dueCalc = calculateTotalDueWithCredit(4129, 1000, 6000, 500);

console.log(dueCalc);
// {
//   currentMonthDue: 4129,
//   previousUnpaidDue: 1000,
//   totalDue: 5129,           // 4129 + 1000
//   totalPaid: 6000,
//   availableCredit: 500,     // Previous credit available
//   creditUsed: 371,          // Credit needed to fully pay dues
//   newCreditBalance: 1000,   // 500 remaining + 871 new credit
//   netDue: 0,               // Amount user still owes (fully paid)
//   remainingDue: 0,         // Legacy field for compatibility
//   dueStatus: "Paid"
// }
```

### Example 4: Credit Usage Scenarios

```typescript
// Scenario A: Credit partially covers dues
const partialCreditScenario = calculateTotalDueWithCredit(
  5000,
  2000,
  3000,
  1000
);
// Result: ₹1,000 credit reduces ₹7,000 total due to ₹6,000, user paid ₹3,000, owes ₹3,000

// Scenario B: Credit fully covers dues
const fullCreditScenario = calculateTotalDueWithCredit(3000, 1000, 2000, 2500);
// Result: ₹2,500 credit reduces ₹4,000 total due to ₹1,500, user paid ₹2,000, creates ₹500 new credit

// Scenario C: Large overpayment creates significant credit
const overpaymentScenario = calculateTotalDueWithCredit(4000, 0, 8000, 0);
// Result: User paid ₹8,000 against ₹4,000 due, creates ₹4,000 credit for future months
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
2. **Credit Benefits**: Overpayments automatically create credit for future months
3. **Transparent Calculation**: Clear breakdown of due amounts, credit usage, and balances
4. **Cumulative Tracking**: See all outstanding amounts and available credits in one place
5. **Flexible Payment**: Partial payments and overpayments are properly handled
6. **Peace of Mind**: Never lose money from overpayments

### For Administrators

1. **Automated Calculation**: No manual prorating or credit management needed
2. **Accurate Tracking**: Comprehensive due and credit management
3. **Better Reports**: Enhanced payment analytics with credit insights
4. **Reduced Disputes**: Clear, transparent calculations with credit visibility
5. **Simplified Accounting**: Automated credit balance handling

### For Business

1. **Improved Cash Flow**: More accurate billing with fair credit system
2. **Reduced Manual Work**: Automated calculations and credit management
3. **Better Customer Satisfaction**: Fair billing practices with credit benefits
4. **Comprehensive Reporting**: Enhanced financial insights including credit analysis
5. **Competitive Advantage**: Advanced billing system builds customer trust

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

4. **Credit Balance Issues (NEW)**

   - Verify previous months' due records exist
   - Check if overpayments were properly recorded
   - Ensure credit calculations include all payment history
   - Validate `creditBalance` field is not negative

5. **Incorrect Credit Application**
   - Check available credit calculation
   - Verify credit is applied to the correct month
   - Ensure `creditUsed` doesn't exceed available credit
   - Validate `netDue` calculation accuracy

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

### Phase 2 Enhancements (Next)

1. **Credit Expiration**: Optional credit expiration dates for policy compliance
2. **Credit Transfer**: Allow credit transfer between users (family members)
3. **Credit Limits**: Maximum credit balance limits per user
4. **Credit Reports**: Detailed credit usage and balance reports

### Advanced Features

1. **Advanced Proration Rules**: Different rules for different room types
2. **Seasonal Pricing**: Support for seasonal rent variations with credit compatibility
3. **Grace Periods**: Configurable grace periods for late payments
4. **Automated Reminders**: Smart reminder system based on due amounts and credit balances
5. **Payment Plans**: Support for installment payments with credit integration
6. **Mobile Notifications**: Push notifications for due amounts and credit updates

### Business Intelligence

1. **Credit Analytics**: Advanced analytics on credit patterns and usage
2. **Predictive Modeling**: Predict payment patterns based on credit history
3. **Integration**: Connect with external payment gateways supporting credit
4. **Reports**: Advanced analytics and reporting features including credit insights

## Implementation Status

### ✅ Completed (Phase 1)

- [x] Credit Balance System
- [x] Automatic Credit Application
- [x] Cross-Month Credit Tracking
- [x] Enhanced Due Calculation with Credit
- [x] API Integration
- [x] Database Schema Updates
- [x] Utility Functions for Credit Management

### 🚧 In Progress

- [ ] UI Components for Credit Display
- [ ] Credit Summary Dashboard
- [ ] Admin Credit Management Tools

### 📋 Planned

- [ ] Credit Expiration System (Phase 2)
- [ ] Advanced Credit Reports
- [ ] Credit Transfer Features

## Testing

The Credit Balance System includes a comprehensive test suite to ensure reliability and accuracy.

### Quick Test Command

```bash
# Interactive test runner (recommended)
./scripts/test-credit-system.sh

# Or run specific tests
npx tsx src/scripts/testCreditSystem.ts        # Unit tests
npx tsx src/scripts/testCreditIntegration.ts   # Integration tests
npx tsx src/scripts/runCreditTests.ts          # Complete suite
```

### Test Coverage

- ✅ **Unit Tests**: All calculation functions and edge cases
- ✅ **Integration Tests**: Database operations and real scenarios
- ✅ **API Tests**: Endpoint functionality and responses
- ✅ **Edge Cases**: Invalid inputs and boundary conditions

For detailed testing information, see [`CREDIT_SYSTEM_TESTS.md`](./CREDIT_SYSTEM_TESTS.md).

## Support

For questions or issues with the prorated rent feature, please check:

1. This documentation
2. API endpoint documentation
3. Test scripts and examples
4. Database schema reference

The feature is designed to be robust and handle various edge cases, but always test with your specific use case before deploying to production.
