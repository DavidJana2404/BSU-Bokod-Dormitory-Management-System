# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

BSU Bokod Dormitory Management System - A Laravel 12 + React 19 + Inertia.js application for managing dormitory operations at BSU Bokod Campus. The system implements multi-tenancy with role-based access control across four user types: Admin, Manager, Cashier, and Dormitorians (students).

## Common Commands

### Development
```powershell
# Start development environment (runs PHP server, queue worker, and Vite)
composer run dev

# Alternative: Start with SSR support
composer run dev:ssr

# Start only PHP server
php artisan serve

# Start only Vite dev server
npm run dev
```

### Database
```powershell
# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Fresh migration with seeders
php artisan migrate:fresh --seed

# Create test cashier account
php artisan db:seed --class=CashierSeeder
```

### Testing
```powershell
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run with coverage report
php artisan test --coverage

# Run single test file
php artisan test tests/Feature/ApplicationApprovalTest.php

# Run tests using Pest directly
./vendor/bin/pest
```

### Frontend
```powershell
# Build for production
npm run build

# Build with SSR support
npm run build:ssr

# Type check TypeScript
npm run types

# Lint and fix code
npm run lint

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

### Code Quality
```powershell
# Run Laravel Pint (PHP code style fixer)
./vendor/bin/pint

# Run Pint with dry-run
./vendor/bin/pint --test

# Clear all caches
php artisan optimize:clear
```

## Architecture Overview

### Authentication System (Dual Guard)

The system uses **two separate authentication guards** to handle different user types:

1. **`web` guard** - For staff users (Admin, Manager, Cashier)
   - Uses `users` table
   - Role stored in `role` column: `admin`, `manager`, `cashier`
   - Middleware: `EnsureUserRole`

2. **`student` guard** - For dormitorians
   - Uses `students` table (separate from users)
   - Primary key: `student_id`
   - Middleware: `EnsureStudentGuard`

**Critical**: The middleware prevents guard conflicts by logging out conflicting sessions. Never authenticate a user on both guards simultaneously.

### Multi-Tenancy Pattern

Tenancy is implemented at the **dormitory level** via the `tenants` table:

- **Admin** - Full access across all dormitories (`tenant_id` is null)
- **Manager** - Scoped to single dormitory (has `tenant_id`)
- **Cashier** - Access to all dormitories for payment processing
- **Student** - Belongs to single dormitory (`tenant_id` references dormitory)

When querying data in controllers, **always scope by tenant** for managers:
```php
if ($user->role === 'manager') {
    $query->where('tenant_id', $user->tenant_id);
}
```

### Core Data Models

Key relationships:
- `Tenant` (dormitories) → has many `Room`, `Student`, `Application`
- `Room` → belongs to `Tenant`, has many `Booking`, has many `CleaningSchedule`
- `Student` → belongs to `Tenant`, has many `Booking`
- `Booking` → belongs to `Student` and `Room`, **semester-based** (not date-based)
- `Application` → belongs to `Tenant`, processed into `Student` upon approval
- `User` → belongs to `Tenant` (if manager), soft deletes use `archived_at`

### Frontend Structure

**Framework**: React 19 + TypeScript + Inertia.js + Tailwind CSS 4

Directory structure:
- `resources/js/pages/` - Inertia page components organized by feature
  - `admin/` - Admin-specific pages
  - `applications/` - Application management
  - `bookings/` - Booking management
  - `cashier/` - Cashier dashboard and payment tracking
  - `student/` - Student dashboard and settings
  - `rooms/`, `students/`, `cleaning-schedules/` - Other feature pages
- `resources/js/components/` - Reusable React components (Radix UI based)
- `resources/js/layouts/` - Layout components
- `resources/js/types/` - TypeScript type definitions
- `resources/js/lib/` - Utility libraries
- `resources/js/hooks/` - Custom React hooks

**Path alias**: Use `@/*` to import from `resources/js/`:
```typescript
import { Button } from '@/components/ui/button';
```

### Routing Structure

Routes are organized by authentication and role:

1. **Public routes** (`routes/web.php`)
   - Application submission: `POST /applications`
   - Student password setup: `/student/setup-password`
   - API: `/api/dormitories`, `/api/student/check`

2. **Student routes** (middleware: `auth:student`, `ensure.student.guard`)
   - Dashboard: `/student/dashboard`
   - Status updates: `PUT /student/status`
   - Settings: imported from `routes/student-settings.php`

3. **Cashier routes** (middleware: `auth`, `verified`)
   - Dashboard: `/cashier/dashboard`
   - Payment management: `PUT /cashier/students/{student}/payment`
   - Payment records and archives

4. **Admin/Manager routes** (middleware: `auth`, `verified`, `ensure.user.role`)
   - Dashboard, dormitories, rooms, students, bookings
   - Application processing: `/applications/*`
   - Cleaning schedules, user management

### Database Schema Notes

- **Soft deletes** use `archived_at` column (not standard `deleted_at`)
- **Bookings** are semester-based with `semester_count` field (migrated from date-based system)
- **Rooms** have `price_per_semester` (not daily/monthly pricing)
- **Students** have separate authentication fields and payment tracking

### Performance Optimizations

Custom middleware in place:
- `RenderOptimizationMiddleware` - Optimizes Inertia rendering
- `OptimizedAssetPreloading` - Intelligent asset preloading
- `DebugErrorMiddleware` - Comprehensive error handling to prevent 502 errors

When modifying queries, use eager loading to prevent N+1 queries:
```php
$students = Student::with(['tenant', 'bookings.room'])->get();
```

## Development Patterns

### When Adding New Features

1. **Create migration** if database changes needed
2. **Update model** with relationships and fillable fields
3. **Create/modify controller** with proper tenant scoping
4. **Add routes** to appropriate middleware group
5. **Create Inertia page component** in `resources/js/pages/`
6. **Add TypeScript types** in `resources/js/types/`
7. **Write tests** in `tests/Feature/` or `tests/Unit/`

### Testing Database State

The system uses **SQLite in-memory** for tests (configured in `phpunit.xml`). Tests automatically reset the database between runs.

### Working with Inertia.js

Always return Inertia responses from controllers:
```php
return Inertia::render('PageComponent', [
    'prop' => $value,
]);
```

Access props in React components via `usePage()` hook or component props.

### Session Management

User type is tracked in session:
- `user_type` - Either `'user'` (staff) or `'student'`
- `user_role` - For staff users: `'admin'`, `'manager'`, or `'cashier'`

Middleware automatically maintains session consistency and prevents conflicts.

## Known Issues

- `ApplicationApprovalTest` has a failing test (noted in README deployment checklist)
- Debug/emergency endpoints exist in `routes/web.php` (should be removed in production):
  - `/fix-booking-schema`
  - `/debug-email-config`
  - `/debug-info`
  - `/debug-inertia`
  - `/health-check`

## Deployment

The project is configured for **Render.com** deployment using Docker:
- `Dockerfile` - Multi-stage build
- `render.yaml` - Service configuration
- `render-build.sh`, `render-deploy.sh` - Build/deploy scripts
- Uses PostgreSQL in production, SQLite in development

Environment files:
- `.env.example` - Base configuration
- `.env.production.example` - Production settings
- `.env.render` - Render-specific config

## Important Files

- `bootstrap/app.php` - Application bootstrap, middleware configuration
- `config/auth.php` - Dual guard authentication setup
- `app/Http/Middleware/` - Custom middleware for role enforcement
- `database/migrations/` - Schema definitions
- `routes/web.php` - Main routing file
- `resources/js/app.tsx` - Frontend entry point
