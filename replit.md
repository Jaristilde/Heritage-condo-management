# Heritage Condominium Management Platform

## Overview

The Heritage Condominium Management Platform is a financial management application for condominium associations. It provides comprehensive financial oversight for board members and management, and personal account access for unit owners. Key capabilities include managing maintenance fees, special assessments, payment processing, vendor management, and financial reporting for a 24-unit condominium building. The platform is a full-stack web application with a React frontend, an Express backend, and a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React with TypeScript, using Vite.
- **UI Component System**: shadcn/ui (New York variant) built on Radix UI, customized with Inter font for text, JetBrains Mono for financial numbers, and a custom Tailwind CSS configuration for light/dark mode.
- **Routing**: Wouter for client-side, role-based access.
- **State Management**: TanStack Query for server state and API caching; localStorage for local authentication with JWT.
- **Design Decisions**: Single-page application, component-based, responsive design with mobile-first breakpoints, dark mode support.
- **Data Visualization**: Recharts library for interactive charts and KPIs on the Board Dashboard.

### Backend

- **Server Framework**: Express.js on Node.js (ES modules).
- **API Design**: RESTful API structure for authentication, unit/owner data, payments, assessments, vendors, and dashboard statistics.
- **Authentication & Authorization**: JWT-based with role-based access control (RBAC) for `board`, `management`, and `owner` roles. Passwords are hashed with bcrypt.
- **Data Access Layer**: Centralized `server/storage.ts` for database abstraction.

### Database

- **Database System**: PostgreSQL, accessed via Neon's serverless driver.
- **ORM**: Drizzle ORM for type-safe queries and schema management.
- **Schema Structure**:
    - **Users**: Authentication, roles, unit association.
    - **Units**: Financial tracking per unit (maintenance, assessments, balances, delinquency).
    - **Owners**: Contact information, linked to units.
    - **Payments**: Transaction history.
    - **Payment Plans**: Installment arrangements.
    - **Assessments**: Special assessment campaigns.
    - **Vendors**: Service provider directory.
- **Design Rationale**: Prioritizes financial accuracy and auditability with explicit balance tracking and denormalized totals for performance.

### Key Features

- **Visual Board Dashboard**: Provides interactive financial insights (KPIs, payment status, revenue/expense analysis, trends, alerts, quick actions) for board and management roles.
- **Vendor Management System**: CRUD operations for managing service providers, including search, forms with Zod validation, and color-coded payment status.
- **AI-Powered Financial Systems**:
    - **Monthly Financial Report Generator**: Generates a 7-page PDF financial report with AI-generated commentary (Balance Sheet, Income Statement, Delinquency Report, Cash Flow, Bank Reconciliation, Management Discussion & Analysis) using Claude Sonnet 4.
    - **AI Budget Proposal Agent**: Analyzes historical data and generates next year's budget proposal with three scenarios (Conservative, Moderate, Optimistic), executive summary, recommended assessment, and risk analysis using Claude Sonnet 4.

## External Dependencies

- **Stripe Payment Processing**: For online payment collection, using `@stripe/stripe-js` and `@stripe/react-stripe-js`. Requires `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY`.
- **Neon PostgreSQL**: Serverless PostgreSQL database, utilizing `@neondatabase/serverless`. Requires `DATABASE_URL`.
- **Anthropic AI**: For AI commentary and budget analysis, using `@anthropic-ai/sdk` and Claude Sonnet 4. Requires `ANTHROPIC_API_KEY`.
- **Environment Configuration**: `DATABASE_URL`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`, `ANTHROPIC_API_KEY` are required environment variables.
- **Third-Party UI Libraries**: Radix UI primitives for accessible components.