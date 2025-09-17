# ShadiKabbo.Com CRM System

## Overview

This is a modern matchmaking CRM system built for ShadiKabbo.Com, designed to manage client relationships, traffic leads, payments, and matchmaking services. The application provides a comprehensive platform for managing matrimonial services with features including client management, payment tracking, and administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark theme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Authentication**: Passport.js with local strategy using session-based auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: Built-in Node.js crypto module with scrypt hashing
- **API Design**: RESTful endpoints with middleware for authentication

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Three main entities:
  - Users: Admin accounts with role-based permissions
  - Traffic: Client leads with comprehensive profile data including personal details, preferences, and requirements
  - Payments: Financial records linked to traffic entries with package types and payment tracking

### Authentication & Authorization
- **Strategy**: Session-based authentication using Passport.js
- **Security**: Secure password hashing with salt using scrypt algorithm
- **Session Management**: PostgreSQL-stored sessions with configurable expiry
- **Route Protection**: Middleware-based authentication checks on API routes and protected React routes

### UI/UX Design Decisions
- **Theme**: Dark theme with blue and red accent colors matching brand identity
- **Component System**: Comprehensive design system using shadcn/ui for consistency
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Animation**: Smooth transitions and loading states for professional feel
- **Accessibility**: ARIA-compliant components from Radix UI primitives

### Development & Deployment
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Development Tools**: Hot module replacement, error overlays, and development banners for Replit
- **Asset Management**: Static file serving with proper caching headers

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Express Session Store**: PostgreSQL-backed session storage using connect-pg-simple

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy support
- **bcryptjs**: Password hashing library (backup to Node.js crypto)
- **Express Session**: Session management with secure cookie handling

### Frontend Libraries
- **Radix UI**: Headless UI component primitives for accessibility and functionality
- **TanStack Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight routing library for React applications
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### Development & Build Tools
- **Vite**: Modern build tool with fast HMR and optimized bundling
- **Drizzle Kit**: Database migration and schema management tools
- **TypeScript**: Static type checking across the entire application
- **Replit Plugins**: Development experience enhancements for the Replit platform

### UI Components & Icons
- **shadcn/ui**: Pre-built accessible component library
- **Lucide React**: Consistent icon library with extensive icon set
- **class-variance-authority**: Type-safe CSS class composition utility