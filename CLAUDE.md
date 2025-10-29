# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds, runs on localhost:3000)
- **Build**: `npm run build`
- **Start production**: `npm run start`
- **Type checking**: `npm run typecheck`
- **Linting**: `npm run lint`
- **Formatting**: `npm run format` (write) or `npm run format:check` (check only)

### Git Hooks
- Husky is configured with lint-staged
- Pre-commit hooks automatically format and lint modified files
- JavaScript/TypeScript files: prettier + eslint
- JSON/CSS/Markdown files: prettier only

## Project Architecture

**ZenBilling Frontend** is a Next.js 15 billing management application built with TypeScript, using the App Router architecture. The application is structured around a comprehensive billing system for businesses.

### Core Technologies
- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for auth state, TanStack Query for server state
- **Authentication**: Better Auth with cookie-based sessions
- **HTTP Client**: Axios with custom interceptors for API communication
- **Forms**: React Hook Form with Zod validation
- **Payment**: Stripe integration
- **UI Components**: Radix UI primitives with custom styling

### Application Structure

#### Authentication & Authorization
- Cookie-based authentication using Better Auth with session cookies
- Zustand store (`src/stores/authStores.ts`) manages auth state with custom cookie persistence (not localStorage)
- Auth state is persisted in `auth-storage` cookie with strict sameSite and secure flags
- Middleware (`src/middleware.ts`) handles route protection and enforces onboarding flow based on user state
- Auth client (`src/lib/auth-client.ts`) manages authentication operations
- Onboarding flow: CHOOSING_COMPANY -> FINISH -> STRIPE_SETUP (tracked via user's onboarding_step)

#### API Layer
- Centralized API client (`src/lib/api.ts`) with Axios (15s timeout, withCredentials enabled)
- Automatic error handling with toast notifications for all error types
- Session management with automatic logout and redirect on 401 responses
- Type-safe API calls with TypeScript interfaces
- Special methods: `api.getBinary()` for file downloads (invoices PDF, etc.) with blob response type
- Base URL from `NEXT_PUBLIC_API_URL` env var (defaults to http://localhost:8080/api)

#### Route Structure
- **App Router**: `src/app/` directory with nested layouts
- **(app)** group: Main application routes requiring authentication
  - **(dashboard)**: Protected dashboard routes (invoices, customers, products, quotes)
  - **onboarding**: Multi-step user setup flow
- **(auth)**: Login and registration pages
- **(public)**: Public payment pages
- **api**: API routes for Stripe integration

#### Component Architecture
- **UI Components**: `src/components/ui/` - Reusable shadcn/ui components
- **Feature Components**: Organized by domain (invoices/, customers/, products/, quotes/)
- **Modals**: Uses @ebay/nice-modal-react for modal management
- **Responsive Design**: Mobile-first with shadcn/ui sidebar component

#### Data Management
- **Custom Hooks**: Domain-specific hooks in `src/hooks/`:
  - `useAuth`: Authentication operations (login, register, session)
  - `useInvoice`: Invoice CRUD operations
  - `useCustomer`: Customer management
  - `useProduct`: Product management with AI features
  - `useQuote`: Quote/devis management
  - `useCompany`: Company profile and settings
  - `useStripe`: Stripe account and payment operations
  - `useDashboard`: Dashboard statistics
  - `useUser`: User profile management
- **Type Definitions**: Comprehensive interfaces in `src/types/`
- **Server State**: TanStack Query for caching and synchronization
- **Error Handling**: Centralized error handling with toast notifications via Axios interceptors

#### Key Features
- Multi-entity billing system (invoices, quotes, customers, products)
- Stripe payment integration with payment links
- Company and user profile management
- AI-powered product suggestions and descriptions
- Multi-step onboarding process
- Dark/light theme support

### Development Guidelines

#### File Organization
- Group related components by feature/domain
- Use TypeScript interfaces from `src/types/` directory
- Follow Next.js App Router conventions for routing
- Use absolute imports with `@/` prefix

#### State Management Patterns
- Use TanStack Query for server state
- Use Zustand only for client-side auth state
- Prefer React Hook Form for form state
- Use React context sparingly

#### API Integration
- Always use the centralized `api` object from `src/lib/api.ts`
- Define TypeScript interfaces for all API requests/responses
- Handle errors through API interceptors (automatic toast notifications)
- Use TanStack Query mutations for data modifications

#### Component Development
- Follow shadcn/ui patterns for new components
- Use Radix UI primitives when available
- Implement proper loading and error states
- Ensure mobile responsiveness

#### Authentication Flow
- All protected routes require authentication via middleware
- Onboarding flow is enforced for new users
- Session management is handled automatically
- Use auth store for accessing current user data

### Environment Configuration
Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_API_URL`: Backend API URL (defaults to http://localhost:8080/api)
- `JWT_SECRET`: Secret key for JWT signing (Better Auth)
- Stripe configuration (API keys) for payment processing

### Important Patterns

#### Custom Hooks Pattern
Each domain has dedicated hooks (e.g., `useInvoice.ts`, `useCustomer.ts`) that encapsulate:
- CRUD operations with TanStack Query
- Loading states and error handling
- Data transformations and validations

#### Modal Management
- Use NiceModal for complex modal interactions
- Modal components are co-located with their trigger components
- Consistent modal patterns across the application

#### Form Handling
- React Hook Form with Zod schemas for validation
- Consistent form patterns with shadcn/ui components
- Automatic error display and loading states

#### Error Handling
- API errors are handled globally through Axios interceptors
- User-friendly error messages via toast notifications
- Automatic session management on authentication errors