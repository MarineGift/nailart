# ConnieNail - Luxury Nail Salon Management System

## Overview
ConnieNail is a comprehensive web-based management platform for a premium nail salon located in Washington, DC. The application serves as a complete business solution handling appointment bookings, customer relationship management, staff scheduling, payment processing, and business analytics. Built with modern web technologies, it supports multiple user roles including customers, staff, managers, and administrators with role-based access control.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses Next.js 14 with TypeScript as the primary frontend framework, implementing the App Router architecture. The UI is built with React components using shadcn/ui component library and styled with Tailwind CSS. The design follows a gradient-based aesthetic with pink and purple themes suitable for a luxury salon brand.

**Key architectural decisions:**
- **Next.js App Router**: Chosen for its server-side rendering capabilities and improved performance
- **TypeScript**: Provides type safety and better developer experience
- **Component-based architecture**: Uses shadcn/ui for consistent, accessible UI components
- **Responsive design**: Tailwind CSS ensures mobile-first responsive layouts

### Backend Architecture
The system uses Next.js API routes for backend functionality, implementing a RESTful API pattern. Database operations are handled through Drizzle ORM with PostgreSQL as the primary database.

**Key architectural decisions:**
- **API Routes**: Next.js API routes provide serverless backend functionality
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Role-based authentication**: Custom authentication system with localStorage persistence
- **Server-side validation**: Ensures data integrity and security

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes comprehensive tables for customers, staff, services, bookings, payments, and system settings.

**Database design rationale:**
- **PostgreSQL**: Chosen for its reliability, ACID compliance, and advanced features
- **Normalized schema**: Reduces data redundancy and ensures consistency
- **Flexible booking system**: Supports complex scheduling requirements and staff assignments
- **Audit trails**: Tracks booking sources, payment records, and user activities

### Authentication and Authorization
The system implements a custom authentication mechanism with role-based access control supporting four user types: customers, staff, managers, and administrators.

**Security approach:**
- **Role-based permissions**: Different access levels for different user types
- **Client-side state management**: Uses React Context for authentication state
- **Local storage persistence**: Maintains login sessions across browser refreshes
- **Permission helpers**: Centralized authorization logic for different operations

## External Dependencies

### Payment Processing
- **Stripe**: Integrated for secure payment processing with support for both one-time payments and subscription billing
- **Stripe React components**: Used for PCI-compliant payment form handling

### Communication Services
- **SendGrid**: Email service integration for automated notifications and marketing communications
- **SMS capabilities**: Planned integration for customer notifications and confirmations

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Animation library for enhanced user experience
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **TypeScript**: Static type checking and improved developer experience
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization

### Image and Media Management
- **Next.js Image**: Optimized image loading and processing
- **External image hosting**: Support for various image providers through URL-based management

### Database and ORM
- **Drizzle Kit**: Database migration and schema management tools
- **PostgreSQL**: Primary database system for data persistence
- **Connection pooling**: Efficient database connection management

The architecture prioritizes maintainability, scalability, and user experience while providing comprehensive salon management capabilities. The modular design allows for easy feature additions and modifications as business requirements evolve.