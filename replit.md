# Heritage Condominium Management Platform

## Overview

The Heritage Condominium Management Platform is a financial management application designed for condominium associations. It serves two primary user groups: board members/management who need comprehensive oversight of all financial operations, and unit owners who need access to their personal account information. The platform handles monthly maintenance fees, special assessments, payment processing, vendor management, and financial reporting for a 24-unit condominium building.

The application is built as a full-stack web application with a React-based frontend using shadcn/ui components for consistent, professional UI design, and an Express backend with PostgreSQL database managed through Drizzle ORM. Payment processing is integrated with Stripe for online transactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: The application uses shadcn/ui (New York variant) built on Radix UI primitives. This provides accessible, composable components with a consistent design language focused on data clarity and professional presentation. The design system is customized for financial data display with:
- Inter font family for headings and body text
- JetBrains Mono for financial numbers to ensure tabular alignment
- Custom Tailwind configuration with HSL-based color system for light/dark mode support
- Specialized spacing and layout primitives optimized for dashboard displays

**Routing**: Client-side routing implemented with Wouter, providing role-based access to different views (board dashboard vs. owner portal).

**State Management**: TanStack Query (React Query) handles server state, API caching, and data synchronization. Local authentication state is managed through localStorage with JWT tokens.

**Key Design Decisions**:
- Single-page application architecture for fluid navigation
- Component-based architecture with reusable UI primitives
- Responsive design with mobile-first breakpoints
- Dark mode support through CSS custom properties

### Backend Architecture

**Server Framework**: Express.js running on Node.js, configured as ES modules for modern JavaScript support.

**API Design**: RESTful API architecture with the following endpoint patterns:
- `/api/auth/*` - Authentication (login, register, token management)
- `/api/units/*` - Unit and owner information
- `/api/payments/*` - Payment transactions and history
- `/api/assessments/*` - Special assessment management
- `/api/vendors/*` - Vendor/contractor information
- `/api/dashboard/*` - Aggregated statistics and metrics

**Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC). Tokens are signed using a SESSION_SECRET environment variable and include user ID, username, role, and associated unit ID. The system supports three roles:
- `board` - Full access to all data and management functions
- `management` - Administrative access for property managers
- `owner` - Limited access to personal unit information only

Middleware validates JWT tokens on protected routes and enforces role-based permissions. Passwords are hashed using bcrypt with 10 salt rounds before storage.

**Data Access Layer**: Centralized storage interface (`server/storage.ts`) provides abstraction over database operations, making it easier to maintain and test data access logic.

### Database Design

**Database System**: PostgreSQL accessed through Neon's serverless driver for connection pooling and edge deployment capabilities.

**ORM**: Drizzle ORM provides type-safe database queries with schema-first design. Migrations are managed through drizzle-kit with configuration in `drizzle.config.ts`.

**Schema Structure**:

1. **Users Table** - Authentication and role management
   - Stores username, hashed password, email, role, and optional unit association
   - UUID primary keys for security

2. **Units Table** - Core financial tracking per condominium unit
   - Tracks monthly maintenance fees and balances
   - Separate columns for first and second assessment statuses and balances
   - Delinquency status tracking (current, 30-60 days, 90+ days, attorney referral)
   - Priority level flags for board attention

3. **Owners Table** - Owner contact information linked to units
   - Supports multiple owners per unit with primary owner designation
   - Tracks owner status (active, deceased, sold)

4. **Payments Table** - Transaction history
   - Records all payment transactions with amount, type, method, and status
   - Links to units and optionally to payment plans
   - Timestamps for audit trail

5. **Payment Plans Table** - Installment arrangements
   - Tracks approved payment plans for owners with outstanding balances
   - Records total amount, monthly installments, and payment schedules

6. **Assessments Table** - Special assessment campaigns
   - Defines assessment types, amounts per unit, and due dates
   - Status tracking for active vs. completed assessments

7. **Vendors Table** - Service provider directory
   - Categorized by vendor type (maintenance, legal, insurance, etc.)
   - Contact information and status tracking

8. **Documents, Board Actions, Notifications Tables** - Supporting features for document management, board decision tracking, and communication (defined but not fully implemented in current codebase)

**Design Rationale**: The schema prioritizes financial accuracy and auditability with explicit balance tracking at multiple levels (maintenance, first assessment, second assessment, total owed). Denormalized totals improve query performance for dashboard displays while maintaining referential integrity through foreign keys.

### External Dependencies

**Stripe Payment Processing**: 
- Integration using `@stripe/stripe-js` and `@stripe/react-stripe-js`
- Handles online payment collection from unit owners
- Requires `STRIPE_SECRET_KEY` environment variable for server-side operations
- Public key (`VITE_STRIPE_PUBLIC_KEY`) for client-side payment element rendering
- Payment flow: client creates payment intent, collects payment details through Stripe Elements, confirms payment without page redirect

**Neon PostgreSQL**:
- Serverless PostgreSQL database with WebSocket support
- Connection managed through `@neondatabase/serverless` package
- Requires `DATABASE_URL` environment variable
- WebSocket constructor from `ws` package for Node.js compatibility

**Environment Configuration**:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - JWT signing key (required, no fallback for security)
- `STRIPE_SECRET_KEY` - Stripe API key for server (required)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key for client (required)
- `TESTING_STRIPE_SECRET_KEY` - Test mode Stripe secret key
- `TESTING_VITE_STRIPE_PUBLIC_KEY` - Test mode Stripe publishable key
- `NODE_ENV` - Environment mode (development/production)

**Demo Credentials**:
The application is seeded with demo accounts for testing:
- Board: `board` / `board123`
- Management: `management` / `management123`
- Owner (Unit 201): `owner201` / `password123`
- Additional owners: `owner202`, `owner203`, ..., `owner408` (all with password `password123`)

Each owner account is linked to their respective unit and can view only their own financial data.

**Development Tools**:
- Replit-specific plugins for error overlay, cartographer, and dev banner
- TypeScript for type safety across the full stack
- ESBuild for production server bundling
- Vite for frontend bundling and hot module replacement

**Third-Party UI Libraries**: Extensive use of Radix UI primitives for accessible component implementation (dialogs, dropdowns, tooltips, etc.) styled with Tailwind CSS utility classes.