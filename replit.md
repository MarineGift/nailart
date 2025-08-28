# Overview

ConnieNail is a comprehensive luxury nail salon management platform built with Next.js and TypeScript. The system provides a full-stack solution for managing bookings, customers, staff, services, and payments for a professional nail salon located in Washington, DC. The platform includes both customer-facing booking functionality and a complete admin dashboard for salon management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 14 with TypeScript and App Router
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks with local state management
- **Authentication**: Context-based auth provider with role-based access control
- **Responsive Design**: Mobile-first approach with comprehensive breakpoint coverage

## Backend Architecture
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Routes**: Next.js API routes for RESTful endpoints
- **Database**: PostgreSQL configured via environment variables
- **Schema Management**: Centralized schema in `shared/schema.ts`
- **Server Components**: Leveraging Next.js server-side rendering capabilities

## Data Storage Solutions
- **Primary Database**: PostgreSQL with SSL connection
- **ORM**: Drizzle with automatic migrations and type generation
- **File Storage**: Image optimization through Next.js with remote pattern support
- **Configuration**: Environment-based database credentials

## Authentication and Authorization
- **Role-Based Access**: Admin, Manager, and Staff roles with different permission levels
- **Session Management**: Browser localStorage with role persistence
- **Protected Routes**: Component-level permission checking
- **Mock Authentication**: Development-ready user system with predefined credentials

## Key Business Features
- **Booking Management**: Full customer booking flow with time slot availability
- **Customer Relationship Management**: Comprehensive customer tracking and VIP status
- **Staff Management**: Employee scheduling, work status, and performance tracking
- **Service Management**: Dynamic service catalog with pricing and duration
- **Payment Processing**: Stripe integration for secure payment handling
- **Analytics Dashboard**: Revenue tracking, booking analytics, and staff performance
- **Calendar System**: Advanced scheduling with employee assignment capabilities

# External Dependencies

## Payment Processing
- **Stripe**: Payment gateway integration with React Stripe.js components
- **Webhooks**: Stripe webhook handling for payment confirmations
- **Security**: PCI-compliant payment processing

## Email Services
- **SendGrid**: Email delivery service for booking confirmations and notifications
- **Templates**: Automated email workflows for customer communication

## UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: Icon library for consistent visual elements
- **Date-fns**: Date manipulation and formatting utilities

## Database and ORM
- **PostgreSQL**: Production-ready relational database
- **Drizzle Kit**: Database migration and schema management tools
- **Connection Pooling**: Optimized database connection handling

## Development Tools
- **TypeScript**: Full type safety across the application
- **ESLint**: Code quality and consistency enforcement
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Autoprefixer**: Cross-browser CSS compatibility

## Third-Party Integrations
- **Image Optimization**: Next.js Image component with remote pattern support
- **CDN**: Unsplash integration for high-quality salon imagery
- **Analytics**: Built-in booking and revenue analytics system