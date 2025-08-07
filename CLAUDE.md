# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build`
- **Type checking**: `npm run typecheck`
- **Linting**: `npm run lint`
- **Formatting**: `npm run format` (write) or `npm run format:check` (check only)

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
- Cookie-based authentication using Better Auth
- Zustand store (`src/stores/authStores.ts`) manages auth state with cookie persistence
- Middleware (`src/middleware.ts`) handles route protection and onboarding flow
- Auth client (`src/lib/auth-client.ts`) manages authentication operations

#### API Layer
- Centralized API client (`src/lib/api.ts`) with Axios
- Automatic error handling with toast notifications
- Session management with automatic logout on 401 responses
- Type-safe API calls with TypeScript interfaces

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
- **Custom Hooks**: Domain-specific hooks in `src/hooks/` (useInvoice, useCustomer, etc.)
- **Type Definitions**: Comprehensive interfaces in `src/types/`
- **Server State**: TanStack Query for caching and synchronization
- **Error Handling**: Centralized error handling with toast notifications

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
- `NEXT_PUBLIC_API_URL`: Backend API URL (defaults to localhost:8080/api)
- Better Auth configuration for authentication
- Stripe configuration for payment processing

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