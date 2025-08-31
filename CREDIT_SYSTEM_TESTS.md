# Credit Balance System - Test Suite Documentation

This document describes the comprehensive test suite for the Credit Balance System implementation.

## Overview

The test suite validates all aspects of the credit balance system, including:

- ✅ Calculation accuracy for various credit scenarios
- ✅ Database operations with real data
- ✅ API endpoint functionality
- ✅ Edge case handling
- ✅ Integration with existing systems

## Test Structure

### 1. Unit Tests (`src/scripts/testCreditSystem.ts`)

**Purpose**: Validates core calculation functions without external dependencies

**Test Categories**:

- **Basic Calculation Tests**: Standard payment and credit scenarios
- **Utility Function Tests**: Credit display formatting and summary calculations
- **Edge Case Tests**: Invalid inputs, boundary conditions, large numbers

**Sample Scenarios Tested**:

```typescript
// Basic payment with no credit
Input: ₹5,000 rent, ₹5,000 paid, ₹0 credit
Result: ✅ Paid, ₹0 due, ₹0 credit

// Overpayment creates credit
Input: ₹5,000 rent, ₹7,000 paid, ₹0 credit
Result: ✅ Paid, ₹0 due, ₹2,000 credit

// Credit partially covers dues
Input: ₹5,000 rent + ₹2,000 unpaid, ₹3,000 paid, ₹1,500 credit
Result: ✅ Partial, ₹2,500 due, ₹0 credit remaining
```

**How to Run**:

```bash
npx tsx src/scripts/testCreditSystem.ts
```

### 2. Integration Tests (`src/scripts/testCreditIntegration.ts`)

**Purpose**: Tests credit system with actual database operations

**Test Categories**:

- **Credit Accumulation**: Verifies overpayments create proper credit records
- **Credit Application**: Tests automatic credit usage for future dues
- **Multi-Month Flow**: Validates credit carries forward correctly
- **Complex Scenarios**: Previous unpaid + credit + overpayment combinations

**Database Operations Tested**:

- Creating UserDue records with credit fields
- Retrieving available credit from previous months
- Updating credit balances across multiple records
- Data consistency and integrity

**Prerequisites**:

- MongoDB connection available
- Database permissions for test data creation/cleanup

**How to Run**:

```bash
npx tsx src/scripts/testCreditIntegration.ts
```

### 3. API Tests (`src/scripts/testCreditApi.ts`)

**Purpose**: Validates API endpoints return correct credit information

**Endpoints Tested**:

- `GET /api/user-dues` - Retrieve dues with credit fields
- `POST /api/user-dues` - Create dues with credit calculations
- `PUT /api/user-dues` - Bulk due generation with credits

**Prerequisites**:

- Next.js development server running
- Database connection active
- Valid authentication (for protected endpoints)

**How to Run**:

```bash
# Start your Next.js server first
npm run dev

# Then run the API tests
npx tsx src/scripts/testCreditApi.ts
```

### 4. Complete Test Runner (`src/scripts/runCreditTests.ts`)

**Purpose**: Orchestrates all test suites with comprehensive reporting

**Features**:

- Sequential execution of all test types
- Detailed progress reporting
- Comprehensive final summary
- Exit codes for CI/CD integration

**How to Run**:

```bash
npx tsx src/scripts/runCreditTests.ts
```

## Quick Start

### Option 1: Interactive Script (Recommended)

```bash
./scripts/test-credit-system.sh
```

This interactive script will:

1. Show you all available test options
2. Let you choose which tests to run
3. Provide clear instructions for prerequisites
4. Give you detailed results and next steps

### Option 2: Individual Test Suites

```bash
# Unit tests only (no prerequisites)
npx tsx src/scripts/testCreditSystem.ts

# Integration tests (requires database)
npx tsx src/scripts/testCreditIntegration.ts

# API tests (requires running server)
npm run dev  # In one terminal
npx tsx src/scripts/testCreditApi.ts  # In another terminal

# Complete suite
npx tsx src/scripts/runCreditTests.ts
```

## Test Scenarios Coverage

### Core Functionality ✅

- [x] Basic payment processing with no credit
- [x] Overpayment creating credit balance
- [x] Credit fully covering future dues
- [x] Credit partially covering future dues
- [x] Complex multi-month credit flows
- [x] Previous unpaid dues with credit application

### Edge Cases ✅

- [x] Negative credit handling (graceful degradation)
- [x] Zero rent scenarios
- [x] Very large number handling
- [x] Decimal precision accuracy
- [x] Invalid input validation

### Database Integration ✅

- [x] Credit accumulation from overpayments
- [x] Credit application to future months
- [x] Multi-month credit balance tracking
- [x] Complex scenarios with previous unpaid amounts
- [x] Data consistency across operations

### API Integration ✅

- [x] Credit fields in API responses
- [x] Credit calculations via API endpoints
- [x] Bulk operations with credit processing
- [x] Error handling for invalid requests

## Test Results Interpretation

### Success Indicators

```bash
✅ ALL TESTS PASSED
🎉 The Credit Balance System is working correctly!
```

### Failure Indicators

```bash
❌ SOME TESTS FAILED
⚠️  Some tests failed. Please review the implementation.
```

### Common Failure Causes

1. **Database Connection Issues**

   - MongoDB not running
   - Connection string incorrect
   - Database permissions

2. **Server Not Running**

   - Next.js dev server not started
   - Wrong port configuration
   - Authentication issues

3. **Logic Errors**
   - Incorrect calculation implementation
   - Missing credit field updates
   - Status determination bugs

## Integration with CI/CD

The test suite is designed for automated testing:

```yaml
# Example GitHub Actions workflow
- name: Run Credit System Tests
  run: |
    npx tsx src/scripts/testCreditSystem.ts
    npx tsx src/scripts/testCreditIntegration.ts
  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

**Exit Codes**:

- `0`: All tests passed
- `1`: Some tests failed

## Performance Benchmarks

### Unit Tests

- **Duration**: ~2-5 seconds
- **Memory**: <50MB
- **Dependencies**: None

### Integration Tests

- **Duration**: ~10-30 seconds
- **Memory**: ~100MB
- **Dependencies**: MongoDB connection

### API Tests

- **Duration**: ~15-45 seconds
- **Memory**: ~150MB
- **Dependencies**: Running Next.js server

## Extending the Test Suite

To add new test scenarios:

1. **Add Unit Test**:

```typescript
// In src/scripts/testCreditSystem.ts
const newScenario: TestScenario = {
  name: "Your Test Name",
  description: "What this test validates",
  input: {
    /* test inputs */
  },
  expected: {
    /* expected outputs */
  },
};
```

2. **Add Integration Test**:

```typescript
// In src/scripts/testCreditIntegration.ts
async function testYourScenario(userId: Types.ObjectId) {
  // Your test implementation
}
```

3. **Add API Test**:

```typescript
// In src/scripts/testCreditApi.ts
const apiTest: ApiTestScenario = {
  name: "Your API Test",
  endpoint: "/api/your-endpoint",
  method: "POST",
  validate: (response) => {
    /* validation logic */
  },
};
```

## Troubleshooting

### Test Failures

1. Check the detailed error output
2. Verify all prerequisites are met
3. Check database connection and permissions
4. Ensure server is running for API tests
5. Review recent code changes for logic errors

### Environment Issues

1. Verify Node.js version (recommended: 16+)
2. Check npm dependencies are installed
3. Confirm database configuration
4. Validate environment variables

### Getting Help

1. Review test output carefully
2. Check the main documentation (`PRORATED_RENT_FEATURE.md`)
3. Examine the actual vs expected results
4. Test individual components in isolation

## Conclusion

This comprehensive test suite ensures the Credit Balance System works correctly across all scenarios. The tests provide confidence for production deployment and serve as documentation for expected behavior.

**Remember**: Always run at least the unit tests before committing changes, and run the complete suite before major releases.
