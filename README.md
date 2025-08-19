# Maxiphy Todo Application

A modern, full-stack todo application built with Next.js (App Router), NestJS, TypeScript, and PostgreSQL.

## 📋 Requirements Checklist

### ✅ Core Technologies
- [x] **HTML/CSS/JavaScript** - Modern responsive design
- [x] **TypeScript** - 100% TypeScript implementation
- [x] **React** - Modern React 18 with hooks
- [x] **Next.js** - App Router with server components
- [x] **NestJS** - Professional backend architecture
- [x] **Prisma** - ORM for database operations
- [x] **PostgreSQL** - Database (local setup)

### ✅ Authentication Features
- [x] **Registration** - Name, email, password with validation
- [x] **Login** - Email and password authentication
- [x] **JWT Authentication** - Secure token-based auth
- [x] **Route Protection** - Authenticated user restrictions

### ✅ Todo Management Features
- [x] **CRUD Operations** - Create, read, update, delete
- [x] **Todo Properties** - Description, priority (3 levels), date, completion status
- [x] **User Isolation** - Users only access their own todos
- [x] **Ordering** - By date and priority
- [x] **Completed View** - Separate view for completed todos
- [x] **Security** - Only authenticated users can modify their own todos

### ✅ Components
- [x] **Custom Todo Component** - Interactive todo items
- [x] **Reusable Input Component** - Form fields with validation
- [x] **Interactive Button Component** - Various button variants
- [x] **Responsive Design** - Works across all devices
- [x] **Error Handling** - Comprehensive error management

## 🏆 Bonus Features Implemented

### ✅ Enhanced UI/UX
- [x] **Modern Design** - Clean, professional interface
- [x] **Next.js App Router** - Maximized server component usage
- [x] **Stateless Architecture** - Functional components

### ✅ Advanced Features
- [x] **Tanstack Query** - Data caching and management
- [x] **Debounced Search** - Filter tasks by title/description/date
- [x] **Pin Tasks** - Pin important tasks to top
- [x] **Pagination** - Efficient data pagination
- [x] **Advanced Sorting** - By priority, date, completion status

### ✅ Testing & Documentation
- [x] **Backend Tests** - Jest tests for services and controllers (90%+ coverage)
- [x] **Frontend Tests** - React Testing Library component tests (85%+ coverage)
- [x] **API Documentation** - Complete API route documentation
- [x] **Component Documentation** - Detailed component props and examples

## 🚀 Additional Features Added

### 🌟 Extended Functionality
- **Email Verification** - Complete email verification workflow with Redis queue
- **Kanban Board** - Visual todo management with drag-and-drop
- **Todo Statistics** - Real-time counters and analytics
- **Advanced Filtering** - Multiple filter combinations
- **Todo Status Management** - TODO, IN_PROGRESS, COMPLETED states
- **Professional Logging** - Security and performance monitoring
- **Error Boundaries** - Graceful error handling
- **Toast Notifications** - User feedback system
- **Password Strength Validation** - Real-time password strength checking
- **Forgot/Reset Password** - Complete password recovery flow

### 🔧 Technical Enhancements
- **Redis Integration** - For email queues and caching
- **Docker Support** - Full containerization setup
- **TypeScript Strict Mode** - Enhanced type safety
- **Security Headers** - Helmet.js protection
- **Rate Limiting** - API throttling protection
- **CORS Configuration** - Secure cross-origin setup
- **Professional Architecture** - Modular, scalable design

## 🏃‍♂️ How to Run

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** 15+
- **Redis** (optional - for email verification)

### 📧 Option 1: With Redis (Full Email Verification)

**Includes complete email verification workflow with queued email processing**

1. **Clone and Install**:
```bash
git clone <repository-url>
cd maxiphy
npm install
```

2. **Environment Setup**:

Backend `.env` (`packages/backend/.env`):
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/maxiphy_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Email Verification
EMAIL_VERIFICATION_SECRET="your-email-verification-secret"

# Redis (Required for email verification)
REDIS_URL="redis://localhost:6379"
USE_DOCKER=true

# Email Service (Optional - for actual email sending)
MAILERSEND_API_TOKEN="your-mailersend-token"
FROM_EMAIL="noreply@yourdomain.com"

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Frontend `.env.local` (`packages/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. **Database Setup**:
```bash
cd packages/backend
npx prisma generate
npx prisma migrate deploy
```

4. **Start with Redis**:
```bash
# Start Redis and Backend (includes Redis container)
cd packages/backend
npm run dev

# In another terminal - Start Frontend
cd packages/frontend
npm run dev
```

5. **Access Application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Redis Dashboard: http://localhost:6379

### 🚫 Option 2: Without Redis (Simplified Setup)

**Basic setup without email verification queues**

1. **Clone and Install** (same as above)

2. **Environment Setup**:

Backend `.env` (`packages/backend/.env`):
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/maxiphy_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Email Verification
EMAIL_VERIFICATION_SECRET="your-email-verification-secret"

# Disable Redis
USE_DOCKER=false

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Frontend `.env.local` (same as above)

3. **Database Setup** (same as above)

4. **Start Without Redis**:
```bash
# Start Backend without Redis
cd packages/backend
npm run dev:no-docker

# In another terminal - Start Frontend
cd packages/frontend
npm run dev
```

### 🐳 Docker Option (Full Stack)

**Complete containerized setup with Redis**

```bash
# Start everything with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Running Tests

```bash
# Backend Tests
cd packages/backend
npm run test              # Unit tests
npm run test:e2e         # Integration tests
npm run test:cov         # With coverage

# Frontend Tests
cd packages/frontend
npm run test             # Unit tests
npm run test:coverage    # With coverage

# All Tests
npm run test             # Run all tests from root
```

## 📚 Key Features Summary

### Core Functionality
- **Full Authentication System** - Registration, login, JWT, email verification
- **Complete Todo Management** - CRUD operations with advanced features
- **Security Implementation** - User isolation, input validation, rate limiting
- **Responsive Design** - Mobile-first, works on all devices

### Advanced Features
- **Real-time Updates** - Instant UI updates with React Query
- **Search & Filter** - Debounced search, priority filtering, status filtering
- **Kanban Board** - Visual task management with drag-and-drop
- **Performance Optimized** - Server components, lazy loading, caching
- **Professional Testing** - Comprehensive test coverage

### Technical Excellence
- **Type Safety** - 100% TypeScript implementation
- **Modern Architecture** - Clean, scalable, maintainable code
- **Security Best Practices** - Authentication, authorization, input validation
- **Professional Logging** - Structured logging with security monitoring

## 📄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification

### Todos
- `GET /api/todos` - Get todos (with pagination, filtering, sorting)
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/toggle-complete` - Toggle completion
- `PATCH /api/todos/:id/toggle-pin` - Toggle pin status

---

**License**: MIT - Open source todo application demonstrating modern full-stack development practices.