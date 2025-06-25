# Project Overview

This is a Vietnamese contract management system built with a modern full-stack architecture. The application helps organizations manage contracts, staff, suppliers, equipment, payments, progress tracking, and document storage.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Express sessions with PostgreSQL store
- **File Handling**: Built-in Express static file serving

### Development Environment
- **Package Manager**: npm
- **Development Server**: tsx for TypeScript execution
- **Build Process**: Vite for frontend, esbuild for backend
- **Database Migrations**: Drizzle Kit
- **Deployment**: Configured for Replit with autoscale deployment

## Key Components

### Database Schema
The system uses a comprehensive PostgreSQL schema with Vietnamese naming conventions:
- Contract types (`loai_hop_dong`)
- Staff management (`can_bo`)
- Suppliers (`nha_cung_cap`)
- Investors (`chu_dau_tu`)
- Budget types (`loai_ngan_sach`)
- Payment methods (`loai_hinh_thuc_thanh_toan`)
- Equipment tracking (`trang_bi`)
- Document management (`file_hop_dong`)
- Progress tracking (`buoc_thuc_hien`)

### API Structure
RESTful API endpoints following Vietnamese naming:
- `/api/dashboard/stats` - Dashboard statistics
- `/api/loai-hop-dong` - Contract type management
- `/api/can-bo` - Staff management
- `/api/nha-cung-cap` - Supplier management
- `/api/hop-dong` - Contract management
- `/api/trang-bi` - Equipment management
- `/api/thanh-toan` - Payment management

### UI Components
- Modular component architecture with Shadcn/ui
- Consistent Vietnamese labeling and messaging
- Responsive design with mobile support
- Form validation with immediate feedback
- Toast notifications for user actions

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **Server Processing**: Express routes handle requests and interact with database
3. **Database Operations**: Drizzle ORM manages PostgreSQL operations
4. **Response Handling**: Data flows back through the same chain with proper error handling
5. **UI Updates**: React Query automatically updates UI on successful mutations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Development
- Runs on port 5000 with hot module replacement
- Uses tsx for TypeScript execution
- Vite dev server with React Fast Refresh
- Real-time error overlay for development

### Production
- Frontend built with Vite to `dist/public`
- Backend bundled with esbuild to `dist/index.js`
- Static files served from Express
- Database migrations run via `npm run db:push`
- Deployed on Replit with autoscale configuration

### Environment Configuration
- Database URL required via `DATABASE_URL` environment variable
- Supports both development and production modes
- Session configuration for user authentication
- File upload handling for document management

## User Preferences

Preferred communication style: Simple, everyday language.
User requires all data to come from database, no mock or placeholder data.
User prefers image storage in database as base64 rather than file system links.
User wants comprehensive CRUD functionality with real-time data updates.

## Recent Changes

- June 25, 2025: Added world map visualization to dashboard
  - Installed react-simple-maps library for interactive world map
  - Created WorldMap component showing countries with suppliers and contracts
  - Added worldMap data endpoint to dashboard API with country coordinates
  - Map displays contract counts with color-coded markers and tooltips
  - Enhanced dashboard with global supplier distribution visualization
- June 25, 2025: Fixed layout issues in reception and budget types pages
  - Recreated reception.tsx with proper component structure and indentation
  - Resolved sidebar layout conflicts and content positioning
  - Added budget types management page with CRUD functionality
  - Implemented custom location input feature for reception management
- June 25, 2025: Added reception management (tiep_nhan) table and functionality
  - Created new table for managing cargo reception with customs clearance information
  - Added location management (dia_diem_thong_quan) for customs clearance locations
  - Implemented full CRUD operations for reception records
  - Added reception page to sidebar navigation with complete UI
  - Includes document numbers tracking: customs declaration, bill of lading, packing list, invoice, insurance
- June 25, 2025: Added related files functionality to contract detail view
  - Integrated file management directly into contract detail modal
  - Users can upload, preview, and download files associated with specific contracts
  - Added file type detection and size validation for documents and images
  - Implemented file preview modal with image display and download options
  - Enhanced contract workflow with comprehensive document management
- June 25, 2025: Enhanced document management with base64 image storage and comprehensive upload functionality
  - Implemented document upload/download with base64 storage in database instead of file system
  - Added image preview functionality for uploaded images
  - Enhanced document viewer modal with PDF and image preview capabilities
  - Improved file validation with size limits (5MB images, 10MB documents)
  - Added drag-and-drop file upload functionality
- June 25, 2025: Updated staff management page with image upload functionality
  - Added profile photo upload for staff members with base64 storage
  - Enhanced staff table display with Avatar components showing actual photos
  - Implemented comprehensive edit/create modal for staff with image upload
  - Added image validation and preview functionality
- June 25, 2025: Fixed investor page real-time data synchronization
  - Resolved contract-investor relationship tracking using ID references
  - Added auto-refresh functionality every 5 seconds for real-time updates
  - Fixed cache invalidation for accurate statistics display
  - Enhanced investor statistics to show actual contract counts and values
- June 25, 2025: Added comprehensive investor management page with statistics and contract tracking
  - Created new investors page with visual statistics cards showing total investors, active partnerships, contracts, and values
  - Implemented full CRUD functionality for investor management with modal forms
  - Added contract count and value tracking per investor with status indicators
  - Integrated investor page into sidebar navigation with Building2 icon
  - Enhanced investor data display with logos, contact information, and partnership status
- June 25, 2025: Enhanced payments and progress pages with contract grouping and detailed views
  - Both payment and progress pages now group records by contract for better organization
  - Added contract headers showing progress summaries and payment totals
  - Implemented view-only modal for progress steps with disabled form fields
  - Enhanced UI with visual progress indicators and status badges
  - Improved workflow with view, edit, and delete actions for all records
- June 25, 2025: Added payment information section to contract detail modal
  - Displays all payment records for the specific contract
  - Shows payment summary with total count, value, and completion status
  - Individual payment details with amount, type, method, and due date
  - Visual indicators for paid/unpaid status with color-coded badges
  - Comprehensive payment tracking integrated into contract view workflow
- June 25, 2025: Reorganized progress management page with contract grouping
  - Progress steps now grouped by contract instead of flat list
  - Each contract shows overall progress summary and statistics
  - Contract headers display completion rate and status breakdown
  - Individual steps maintain detailed view with progress tracking
  - Improved visual hierarchy and easier progress monitoring per contract
- June 25, 2025: Added progress step management directly in contract detail modal
  - Integrated progress step creation form within contract view popup
  - Users can now add new progress steps without leaving contract detail view
  - Form includes all necessary fields: name, status, dates, description
  - Auto-increments step order and updates dashboard statistics
  - Improved workflow for contract and progress management
- June 25, 2025: Enhanced contract information display with detailed reference data
  - Updated contract view modal to show detailed information instead of IDs
  - Contract table now displays supplier name, investor name, and staff details
  - Form dropdowns show rich information with addresses and contact details
  - Replaced ID-based display with user-friendly detailed information throughout
- June 25, 2025: Enhanced dashboard with sample data and interactive charts
  - Added comprehensive sample data seeding with realistic Vietnamese contracts
  - Implemented interactive charts using Recharts (pie charts, bar charts)
  - Added clickable navigation links from dashboard overview cards
  - Progress tree structure in contract detail view with auto-increment order
  - Dashboard now shows real statistics from database with visual representations
  - Contract status distribution, payment tracking, and progress monitoring charts
- June 25, 2025: Completed comprehensive CRUD functionality for all pages
  - Contracts page: View, edit, delete operations with contract detail modal
  - Progress page: Full progress tracking with timeline management and status updates
  - Payments page: Complete payment management with financial calculations
  - Documents page: File upload, edit, delete with document management
  - Equipment page: Equipment tracking with pricing and status management
  - Added default reference data for all dropdown selections
  - Implemented proper modal components for all CRUD operations
- June 25, 2025: Fixed contract types dropdown with default reference data
- June 25, 2025: Added comprehensive CRUD APIs for all entities
- June 25, 2025: Fixed TypeScript storage implementation
- June 25, 2025: Initial setup with Vietnamese contract management system

## Changelog

Changelog:
- June 25, 2025. Initial setup and complete CRUD API implementation