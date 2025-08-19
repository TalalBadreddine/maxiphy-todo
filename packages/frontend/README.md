# MaxiPhy - Professional Authentication System

A production-ready Next.js application with TypeScript, Tailwind CSS, and enterprise-level authentication features.

## 🚀 Features

- **Authentication System**: Login/Register with form validation
- **TypeScript**: Strict type checking and enhanced developer experience
- **Tailwind CSS**: Modern utility-first CSS framework
- **TanStack Query**: Powerful data synchronization for React
- **React Hook Form**: Performant forms with easy validation
- **Zod Validation**: TypeScript-first schema validation
- **Professional Architecture**: Separation of concerns with proper folder structure

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── register/          # Registration page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/Login page
├── components/            # React components
│   ├── auth/              # Authentication components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── layout/            # Layout components
│   │   ├── auth-layout.tsx
│   │   └── dashboard-layout.tsx
│   ├── providers/         # Context providers
│   │   └── providers.tsx
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form-field.tsx
│       ├── input.tsx
│       └── label.tsx
├── hooks/                 # Custom React hooks
│   ├── auth/              # Authentication hooks
│   │   └── use-auth.ts
│   └── query/             # TanStack Query hooks
│       └── index.ts
├── lib/                   # Utility libraries
│   ├── utils/             # Utility functions
│   │   └── cn.ts
│   └── validations/       # Zod validation schemas
│       └── auth.ts
├── services/              # API services
│   ├── api/               # API client configuration
│   │   └── client.ts
│   └── auth/              # Authentication services
│       └── auth.service.ts
├── types/                 # TypeScript type definitions
│   ├── api/               # API types
│   │   └── index.ts
│   └── auth/              # Authentication types
│       └── index.ts
└── utils/                 # General utilities
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Architecture Principles

### Component Architecture
- **Small Components**: Each component has a single responsibility
- **Separation of Concerns**: UI components separate from business logic
- **Reusable UI**: Common UI components in `/components/ui/`
- **Type Safety**: Full TypeScript coverage with strict settings

### State Management
- **TanStack Query**: Server state management with caching
- **React Hook Form**: Form state with validation
- **Local Storage**: Authentication token persistence

### API Layer
- **Axios Client**: Centralized HTTP client with interceptors
- **Service Layer**: Dedicated services for different domains
- **Error Handling**: Comprehensive error handling with user feedback
- **Type Safety**: Full typing for API requests and responses

### Security Features
- **Token Management**: JWT tokens with refresh mechanism
- **Form Validation**: Client-side and server-side validation
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Password Strength**: Real-time password strength indicator

## 🎨 UI Components

### Form Components
- **FormField**: Complete form field with label, input, and error display
- **Button**: Variants include default, outline, secondary, ghost, link
- **Input**: Styled input with error states
- **Label**: Accessible labels with required indicators

### Layout Components
- **AuthLayout**: Centered layout for authentication pages
- **DashboardLayout**: Full dashboard layout with navigation
- **Card**: Flexible card component for content containers

## 🔐 Authentication Flow

1. **Login**: Email/password authentication with validation
2. **Register**: User registration with password strength checking
3. **Token Management**: Automatic token storage and refresh
4. **Protected Routes**: Dashboard requires authentication
5. **Logout**: Secure logout with token cleanup

## 📱 Features Implemented

### Login Page
- Email and password validation
- Error handling and display
- Loading states
- Responsive design

### Registration Page
- Complete user information collection
- Password strength indicator
- Confirm password validation
- Real-time form validation

### Dashboard
- User welcome message
- Navigation with logout
- Task metrics placeholder
- Responsive layout

## 🔮 Next Steps for Backend Integration

When implementing the NestJS backend:

1. **API Endpoints**: The services are configured to work with these endpoints:
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `POST /api/auth/refresh`
   - `POST /api/auth/logout`
   - `GET /api/auth/me`

2. **Data Format**: API responses should follow this structure:
   ```typescript
   {
     data: T,
     message: string,
     success: boolean
   }
   ```

3. **Authentication**: JWT tokens expected in Authorization header: `Bearer <token>`

## 🧪 Development Guidelines

- Follow TypeScript strict mode
- Use proper error boundaries
- Implement loading states
- Add proper accessibility attributes
- Maintain consistent component patterns
- Use semantic HTML elements

## 📦 Dependencies

### Core
- Next.js 15.4.6
- React 19.1.1
- TypeScript 5.9.2

### Styling
- Tailwind CSS 3.4.17
- Class Variance Authority
- Clsx + Tailwind Merge

### Forms & Validation
- React Hook Form 7.53.2
- Zod 3.23.8
- @hookform/resolvers

### Data Fetching
- TanStack Query 5.59.0
- Axios 1.7.7

### UI Components
- Lucide React (icons)
- Custom component library

This foundation provides a robust starting point for building a professional full-stack application with proper separation of concerns and enterprise-level practices.