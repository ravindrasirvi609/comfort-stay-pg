# Comfort Stay PG Management System - AI Coding Guidelines

## Project Overview

This is a Next.js-based Paying Guest (PG) management system for Comfort Stay PG, a girls' accommodation facility. The system handles user registration, room allocation, payment tracking, complaints, and administrative operations.

## Architecture & Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (App Router)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with role-based access (admin/user)
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks + Context providers
- **External Services**: Resend (email), Firebase, WhatsApp integration

## Core Data Models

- **User**: Registration, authentication, room assignment, documents
- **Room**: Building/floor/room structure, capacity, pricing, occupancy
- **Payment**: Cash-only payment tracking with receipts
- **Complaint**: Issue tracking with status updates
- **DueSettlement**: Administrative due waivers (separate from payments)
- **Notification**: System notifications and notices

## Key Patterns & Conventions

### 1. Authentication & Authorization

```typescript
// Always check authentication in API routes
const { isAuth, user } = await isAuthenticated();
if (!isAuth || !user) {
  return NextResponse.json(
    { success: false, message: "Not authenticated" },
    { status: 401 }
  );
}

// Admin-only operations
if (!isAdmin(user)) {
  return NextResponse.json(
    { success: false, message: "Access denied" },
    { status: 403 }
  );
}
```

### 2. Database Connection

```typescript
// Always connect before database operations
await connectToDatabase();
```

### 3. Due Calculation Logic

```typescript
// Complex due calculation: totalDue - totalPaid - totalSettled
// See src/app/lib/dueCalculator.ts for implementation
// Includes prorated rent, settlements, and payment tracking
```

### 4. Caching Strategy

```typescript
// Use in-memory cache for expensive operations
// Default TTL: 5 minutes, cleanup every 10 minutes
// Cache key format: "users-with-dues:status:active|month:current|year:current"
```

### 5. API Response Format

```typescript
// Consistent response structure
return NextResponse.json({
  success: true,
  message: "Operation successful",
  data: result,
});

// Error responses
return NextResponse.json(
  {
    success: false,
    message: "Error description",
  },
  { status: 400 }
);
```

### 6. Component Structure

```tsx
// Use client components for interactivity
"use client";

import { useState, useEffect } from "react";

// Custom hooks for complex logic
const { data, loading, error } = useCustomHook();
```

## Development Workflows

### Database Setup & Seeding

```bash
# Create rooms structure
npm run create-rooms

# Create admin user
npm run create-manager

# Generate sample dues data
npx tsx src/scripts/generateDues.ts
```

### Testing Commands

```bash
# Run settlement tests
node test-settlement.js

# Test credit system
node test-enhanced-settlement.js

# API performance verification
./verify-api-performance.sh
```

### Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Critical Implementation Notes

### Room Management

- Buildings A/B with floors 1-6
- Room types: 2-sharing, 3-sharing
- Capacity tracking with current occupancy
- Bed number assignment within rooms

### Payment System

- Cash-only payments (no online integration)
- Manual payment recording by admin
- Receipt generation required
- Due calculation includes prorated rent

### User Lifecycle

1. Registration (pending status)
2. Admin approval (generates PG ID and password)
3. Room assignment
4. Payment tracking
5. Move-out/disable process

### Settlement System

- Separate from payments (no fake entries)
- Admin can waive dues with audit trail
- Settlement modal with percentage options
- Real-time due recalculation

## File Organization

- `src/app/api/` - API routes (App Router pattern)
- `src/app/lib/` - Utilities, database, auth
- `src/components/` - Reusable UI components
- `src/scripts/` - Data seeding and maintenance scripts
- `src/app/api/models/` - Mongoose schemas
- `src/hooks/` - Custom React hooks

## Common Patterns to Follow

### Error Handling

```typescript
try {
  // Operation
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error("Operation failed:", error);
  return NextResponse.json(
    {
      success: false,
      message: "Operation failed",
    },
    { status: 500 }
  );
}
```

### Data Validation

```typescript
// Use Mongoose schema validation
// Additional runtime validation for business logic
if (!data.requiredField) {
  return NextResponse.json(
    {
      success: false,
      message: "Required field missing",
    },
    { status: 400 }
  );
}
```

### Cache Invalidation

```typescript
// Clear relevant caches after data modifications
cache.delete("users-with-dues:*");
cache.delete("rooms:*");
```

## Key Files to Reference

- `src/app/lib/auth.ts` - Authentication utilities
- `src/app/lib/dueCalculator.ts` - Complex due calculations
- `src/app/lib/cache.ts` - Caching implementation
- `src/middleware.ts` - Route protection
- `src/scripts/createRooms.ts` - Room seeding logic
- `src/components/SettlementModal.tsx` - Settlement UI pattern

## Performance Considerations

- Use caching for expensive database queries
- Implement pagination for large datasets
- Optimize MongoDB queries with proper indexing
- Use Next.js Image component for image optimization
- Implement proper loading states for better UX

## Security Notes

- JWT tokens with proper expiration
- Role-based access control
- Input validation on all API endpoints
- Secure password generation for new users
- Admin-only operations properly protected</content>
  <parameter name="filePath">/Users/rc/Projects/comfort-stay-pg/.github/copilot-instructions.md
