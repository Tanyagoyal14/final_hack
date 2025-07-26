# MagiLearn - Educational Gaming Platform

## Overview

MagiLearn is a full-stack educational platform designed to make learning engaging through gamification. The application features an accessibility-first design with personalized learning experiences, interactive games, and progress tracking. The platform uses a modern React frontend with an Express.js backend, PostgreSQL database, and comprehensive component library.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 26, 2025 - Project Migration and Feature Updates Completed**
- Successfully migrated MagiLearn from Replit Agent to Replit environment
- Fixed color contrast issues for better text visibility with clean white background
- Resolved TypeScript errors in storage and frontend components  
- Database connection established with PostgreSQL - all API endpoints working
- **User Changes**: Updated default user from "Alex Martinez" to "Tanya Goyal"
- **Progress System**: Reset all skills to start at 0% for fresh learning experience
- **Continue Learning**: Added "Continue" button that increases all skills by 5% and awards 25 XP
- **Theme Switching**: Added light/dark mode toggle with sun/moon icons
- Enhanced UI with proper dark mode support across all components

## System Architecture

### Frontend Architecture
The client-side is built with React 18 using TypeScript and employs a modern component-based architecture:

**Problem Addressed**: Need for a responsive, accessible, and interactive educational interface
**Solution**: React with TypeScript, shadcn/ui components, and TailwindCSS for styling
**Rationale**: Provides type safety, reusable components, and excellent accessibility features

- **Router**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Styling**: TailwindCSS with custom design tokens and shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
The server uses Express.js with TypeScript in a modular structure:

**Problem Addressed**: Need for scalable API architecture with proper data validation
**Solution**: Express.js with structured routing and Zod validation
**Rationale**: Familiar Node.js ecosystem with strong TypeScript support

- **API Layer**: RESTful endpoints in `/server/routes.ts`
- **Storage Layer**: Abstracted storage interface with PostgreSQL database implementation
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot module replacement via Vite integration

### Database Architecture
Uses PostgreSQL with Drizzle ORM for type-safe database operations:

**Problem Addressed**: Need for robust data persistence with type safety
**Solution**: PostgreSQL with Drizzle ORM and serverless hosting
**Rationale**: Excellent performance, ACID compliance, and seamless TypeScript integration

- **ORM**: Drizzle ORM with schema-first approach
- **Tables**: Users, UserProgress, DailySpins, UnlockedGames, Achievements, GameStats
- **Enhanced Fields**: Special needs assessment, mood tracking, subject preferences
- **Migrations**: Automated schema push via drizzle-kit
- **Connection**: Serverless PostgreSQL with connection pooling

## Key Components

### Accessibility System
Comprehensive accessibility framework with persistent settings:
- High contrast mode toggle
- Large text size adjustment
- Audio feedback controls
- Settings persisted in localStorage
- ARIA-compliant component implementations

### Game System
Five interactive educational games with progress tracking:
- **Math Ninja**: Arithmetic speed challenges
- **Memory Flip**: Card matching memory game
- **Puzzle Portal**: Sliding puzzle solver
- **Quiz Attack**: Multiple choice knowledge testing
- **Color Match**: Color recognition and learning

### Progress Tracking
Enhanced multi-dimensional skill progression system for personalized learning:
- **Total XP accumulation** across all subjects and activities
- **Subject-specific skills**: Math, English, Science, Coding, Art with individual progress tracking
- **Core Skills**: Language Arts, Problem Solving, Memory Skills for foundational abilities
- **Learning streaks** and achievement system with milestone badges
- **Daily activity tracking** with mood-based content recommendations
- **Special Needs Adaptation**: Progress tracking adapted to individual learning capabilities

### Survey & Personalization
Enhanced user profiling system for students with special needs:
- **Personal Information**: Name, age, class/grade level
- **Special Needs Assessment**: Support for Autism, ADHD, Dyslexia, Physical disabilities
- **Learning Style Preferences**: Visual, Auditory, Kinesthetic learning approaches
- **Subject Interests**: Math, English, Science, Coding, Art with personalized content
- **Mood Tracking**: Daily mood assessment (Happy, Excited, Calm, Curious, Tired, Neutral)
- **Accessibility Features**: High contrast, large text, audio support
- **Personalized Dashboard**: Content adaptation based on learning needs and current mood

## Data Flow

### User Authentication Flow
1. Default user system (simplified for demo)
2. User data fetched via `/api/user/current`
3. Survey completion triggers personalization
4. Progress tracking begins immediately

### Game Session Flow
1. User selects unlocked game from dashboard
2. Game component mounts with real-time state management
3. Progress tracked locally during gameplay
4. Results submitted to backend via game-specific endpoints
5. XP and achievements updated in user profile

### Accessibility Settings Flow
1. Settings loaded from localStorage on app initialization
2. Real-time DOM manipulation for visual changes
3. Settings persisted automatically on any change
4. Applied consistently across all components

## External Dependencies

### UI Framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built accessible components
- **Lucide React**: Consistent iconography
- **TailwindCSS**: Utility-first styling

### Data Layer
- **@neondatabase/serverless**: PostgreSQL connection
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the stack
- **React Query**: Server state management

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- Express server with TypeScript compilation
- Hot reload for both frontend and backend changes
- Replit-specific plugins for enhanced development experience

### Production Build
- Frontend: Vite production build with optimization
- Backend: esbuild compilation to ESM format
- Static assets served by Express in production
- Database migrations applied via drizzle-kit

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development/production mode detection
- Replit-specific integrations for hosting platform

The architecture prioritizes accessibility, maintainability, and educational effectiveness while providing a solid foundation for scaling the platform's features and user base.