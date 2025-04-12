# Comfort Stay PG Management System

A comprehensive Paying Guest (PG) Management System for Comfort Stay PG, built with Next.js, MongoDB, and Tailwind CSS.

## Features

### Authentication & Authorization

- Admin and User Login
- Registration for Users
- Email sending of ID and Password
- Role-based access (admin, user)
- Password reset option

### Resident/User Management

- New registration via form
- Admin can disable a user when they leave
- Move-in / move-out tracking
- User profile management
- Room allotment

### Room & Bed Management

- Add/Edit/Delete Rooms
- Assign/Remove users from rooms
- Check real-time room availability
- Set room type, price, capacity, and status

### Payment (Cash Mode Only)

- Record cash payments manually
- Maintain monthly rent records
- Mark payment status
- Generate receipts

### Complaints & Maintenance

- Users raise complaints via dashboard
- Track complaint status
- Admin assigns staff and resolves issues

### Notice Board

- Admin can create, update, and delete notices for users

### Reports & Analytics

- Occupancy rate
- Rent collection summary
- Complaint reports

### Dashboards

- Admin Dashboard
- User Dashboard

## Tech Stack

- Frontend: Next.js + Tailwind CSS
- Backend: Next.js API Routes
- Database: MongoDB Atlas
- Email Service: Resend
- Auth: JWT (role-based)

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- MongoDB Atlas account

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/comfort-stay-pg.git
cd comfort-stay-pg
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory and add:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the development server

```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## API Endpoints

### Auth API

- POST /api/auth/admin-login
- POST /api/auth/user-login
- POST /api/auth/register
- POST /api/auth/reset-password
- POST /api/auth/logout
- GET /api/auth/me

### User API

- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Room API

- GET /api/rooms
- GET /api/rooms/:id
- POST /api/rooms
- PUT /api/rooms/:id
- DELETE /api/rooms/:id

### Payment API

- GET /api/payments
- GET /api/payments/:id
- POST /api/payments
- PUT /api/payments/:id

### Complaint API

- GET /api/complaints
- GET /api/complaints/:id
- POST /api/complaints
- PUT /api/complaints/:id

### Notice API

- GET /api/notices
- GET /api/notices/:id
- POST /api/notices
- DELETE /api/notices/:id

## License

[MIT](https://choosealicense.com/licenses/mit/)
