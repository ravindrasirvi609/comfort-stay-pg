# API Timeout Fix: Optimization of `/api/users/with-dues` endpoint

## Problem
The `/api/users/with-dues` endpoint was timing out in production (10-second timeout) due to inefficient database queries causing an N+1 query problem.

## Root Cause Analysis

### Original Issues:
1. **N+1 Query Problem**: For each user with a due record, the code was making individual calls to `calculateDueWithSettlements()`, which in turn made 2-3 separate database queries per user.

2. **Excessive Database Queries**: With 100+ users, this resulted in:
   - 1 query for users
   - 1 query for dues  
   - 1 query for all user payments
   - ~100 queries for settlements (one per user)
   - ~100 queries for current month payments (one per user)
   - **Total: ~300+ database queries**

3. **Inefficient Promise.all**: Running hundreds of concurrent async operations that each hit the database.

4. **Duplicate Payment Queries**: Payments were being fetched multiple times for different purposes.

## Solution: Batch Query Optimization

### Optimizations Applied:

#### 1. **Batch Settlement Queries**
- **Before**: Individual `DueSettlement.find()` for each user
- **After**: Single batch query for all users' settlements
```typescript
// Old approach (N queries)
const userSettlements = await DueSettlement.find({
  userId: user._id.toString(),
  month: currentMonthYear,
  isActive: true,
});

// New approach (1 query)
const allSettlements = await DueSettlement.find({
  userId: { $in: userIds },
  month: currentMonthYear,
  isActive: true,
}).lean();
```

#### 2. **Batch Payment Queries**
- **Before**: Individual payment queries in `calculateDueWithSettlements()`
- **After**: Single batch query for current month payments
```typescript
// New optimized approach
const currentMonthPayments = await Payment.find({
  userId: { $in: userIds },
  months: currentMonthYear,
  paymentStatus: "Paid",
  isDepositPayment: false,
  isActive: true,
}).lean();
```

#### 3. **Eliminated Async Processing**
- **Before**: `Promise.all(users.map(async (user) => ...))`
- **After**: Synchronous `.map()` using pre-fetched data
```typescript
// Old approach
const enhancedUsers = await Promise.all(users.map(async (user) => {
  const dueWithSettlements = await calculateDueWithSettlements(...);
  return { ...user, ...dueWithSettlements };
}));

// New approach  
const enhancedUsers = users.map((user) => {
  const totalSettled = settlementsMap.get(user._id.toString()) || 0;
  const totalPaidForMonth = currentMonthPaymentsMap.get(user._id.toString()) || 0;
  return { ...user, totalSettled, totalPaidForMonth };
});
```

#### 4. **Data Structure Optimization**
- Used `Map` objects for O(1) lookups instead of array searches
- Pre-calculated all necessary data upfront
- Eliminated redundant calculations

#### 5. **Removed Unused Dependencies**
- Removed `calculateDueWithSettlements` import since it's no longer needed
- Cleaned up unused variables and functions

### Performance Impact:

#### Query Reduction:
- **Before**: ~300+ database queries (N+1 problem)
- **After**: ~6 database queries (constant time)
  1. Users query
  2. UserDues query  
  3. All user payments query
  4. All settlements query
  5. Current month payments query
  6. Database connection

#### Expected Performance:
- **Before**: 5-10+ seconds (hitting timeout)
- **After**: 500ms - 2 seconds (well under timeout)

## Database Query Summary

### Optimized Query Pattern:
```sql
-- 1. Get all users
SELECT * FROM users WHERE conditions...

-- 2. Get all dues for target month
SELECT * FROM userdues WHERE userId IN [...] AND month = X AND year = Y

-- 3. Get all payments for all users
SELECT * FROM payments WHERE userId IN [...] AND status = 'Paid'

-- 4. Get all settlements for current month
SELECT * FROM duesettlements WHERE userId IN [...] AND month = 'Month YYYY'

-- 5. Get current month payments
SELECT * FROM payments WHERE userId IN [...] AND months CONTAINS 'Month YYYY'
```

## Testing

### Local Testing:
```bash
# Test the optimized endpoint
curl -X GET http://localhost:3000/api/users/with-dues \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Production Deployment:
1. Deploy the optimized code
2. Monitor response times using Vercel dashboard
3. Check for any timeout errors in logs

## Compatibility

The optimization maintains full backward compatibility:
- All response fields remain the same
- API contract unchanged
- Frontend code requires no modifications

## Additional Improvements

Future optimizations that could be considered:
1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Pagination**: Add pagination for large datasets
4. **Connection Pooling**: Optimize database connection management

## Files Modified:
- `/src/app/api/users/with-dues/route.ts` - Main optimization
- `test-optimized-api.js` - Added for testing (can be removed)

## Monitoring

Watch these metrics post-deployment:
- API response time (target: < 3 seconds)
- Error rate (target: < 1%)
- Timeout occurrences (target: 0)
- Database query count per request
