# 🏫 BSU Bokod Dormitory Management System

A comprehensive dormitory management system built with Laravel 12, Inertia.js, and React for BSU Bokod Campus.

## 🚀 Features

### **Multi-Role Access**
- **Admin**: System-wide management, dormitory oversight, user management
- **Manager**: Dormitory-specific management, student registration, room assignments
- **Cashier**: Payment processing and tracking across all dormitories
- **Students**: Personal dashboard, status updates, password management

### **Core Functionality**
- 📋 **Application Management**: Student application processing with approval/rejection workflow
- 🏠 **Room Management**: Room assignments, capacity tracking, pricing per semester
- 👥 **Student Management**: Registration, status tracking, payment monitoring
- 📅 **Booking System**: Semester-based booking (replaced date-based system)
- 💰 **Payment Tracking**: Comprehensive payment status management for cashiers
- 🧹 **Cleaning Schedules**: Room cleaning schedule management
- 📊 **Archive System**: Role-based archive management with bulk operations

## 🛠️ Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 + Inertia.js + TypeScript
- **Styling**: Tailwind CSS 4 + Radix UI Components
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Deployment**: Docker + Render.com
- **Testing**: Pest/PHPUnit

## 📋 Prerequisites

- PHP 8.2 or higher
- Node.js 18+ & NPM
- PostgreSQL (for production)
- Composer

## 🚀 Installation

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/DavidJana2404/BSU-Bokod-Dormitory-Management-System.git
cd BSU-Bokod-Dormitory-Management-System

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Setup environment
cp .env.example .env
php artisan key:generate

# 5. Configure your database in .env file
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=dms_dev
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# 6. Run migrations
php artisan migrate

# 7. Build frontend assets
npm run build

# 8. Start development server
composer run dev
```

### Production Deployment (Render)

This project is configured for deployment on Render.com using Docker.

1. **Fork this repository** to your GitHub account

2. **Create a new Web Service** on Render.com:
   - Connect your GitHub repository
   - Use `Docker` as the runtime
   - Set build command: `docker build -t bsu-bokod-dms .`

3. **Create a PostgreSQL database** on Render.com

4. **Environment variables** are automatically configured via `render.yaml`

5. **Deploy** - Render will automatically build and deploy your application

## 🔐 Default Access

After deployment, you'll need to create initial users through database seeding or manual registration.

### Test Accounts (Development Only)
- Run `php artisan db:seed --class=CashierSeeder` to create test cashier account

## 📚 System Architecture

### Role-Based Access Control
- **Authentication**: Custom middleware with role-based routing
- **Authorization**: Controller-level permissions with tenant isolation
- **Multi-tenancy**: Dormitory-based data separation for managers

### Database Schema
- **Users**: System administrators and managers
- **Students**: Student records with authentication
- **Tenants**: Dormitory/campus information
- **Rooms**: Room details with capacity and pricing
- **Bookings**: Semester-based room assignments
- **Applications**: Student application workflow

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

## 📱 API Endpoints

### Public API
- `GET /api/dormitories` - List available dormitories
- `POST /api/student/check` - Student password setup check

### Admin Routes
- `/assign-manager` - Manager assignment interface
- `/dormitories` - Dormitory management

### Manager Routes
- `/applications` - Student application management
- `/students` - Student management
- `/rooms` - Room management
- `/bookings` - Booking management
- `/cleaning-schedules` - Cleaning schedule management

### Cashier Routes
- `/cashier/dashboard` - Payment management dashboard

### Student Routes
- `/student/dashboard` - Student personal dashboard
- `/student/settings` - Student account settings

## 🔧 Configuration

### Environment Variables
Key environment variables for production:

```env
APP_NAME="BSU Bokod DMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app-url.onrender.com

DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=your-database
DB_USERNAME=your-username
DB_PASSWORD=your-password

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

## 🚀 Deployment Checklist

- [x] Environment variables configured
- [x] Database migrations ready
- [x] Frontend assets built
- [x] Docker configuration complete
- [x] SSL/HTTPS configured (handled by Render)
- [ ] Fix failing test in ApplicationApprovalTest
- [ ] Production monitoring setup
- [ ] Backup strategy implemented

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

## 🔄 Recent Updates

- ✅ Migrated from date-based to semester-based booking system
- ✅ Implemented comprehensive archive system with role-based access
- ✅ Added payment tracking for cashiers across all dormitories
- ✅ Enhanced security with proper role-based middleware
- ✅ Updated UI with modern React 19 and Tailwind CSS 4
- ✅ Implemented comprehensive testing suite

---

**Built with ❤️ for BSU Bokod Campus**

# BSU-Bokod-Dormitory-Management-System
Dormitory Management Manage multiple dormitories, track room availability, and monitor facility status in real-time with comprehensive oversight tools.
