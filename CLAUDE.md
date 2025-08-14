# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server with TailwindCSS compilation
- `npm run build` - Build production version
- `npm run preview` - Preview production build on port 4173
- `npm run check` - Run Svelte type checking
- `npm run lint` - Run linting (Prettier + ESLint)
- `npm run format` - Format code with Prettier

### Testing Commands

- `npm run test` - Run comprehensive test suite (includes all test variants with SW generation)
- `vitest run` - Run unit tests (located in `test/` directory)
- `playwright test` - Run end-to-end tests (located in `client-test/` directory)
- `npm run test-generate-sw` - Run tests with service worker generation
- `npm run test-generate-sw-node` - Run tests with Node adapter and service worker

### BDD Testing Commands

- `npm run test:bdd` - Run BDD tests (auto-starts Supabase, dev server, runs Cucumber tests, cleans up)
- `npm run test:bdd-smoke` - Run smoke tests only (quick validation)
- `npm run test:bdd-manual` - Run BDD tests manually (requires dev server to be running)
- `node scripts/generate-test-report.js` - Generate HTML test reports from JSON output

### Supabase Commands

- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:reset` - Reset local database
- `npm run supabase:studio` - Open Supabase Studio on port 54323
- `npm run dev:supabase` - Start Supabase and development server together

### Environment Setup

Copy `.env.example` to `.env` and configure with your Supabase credentials. For initial data seeding, uncomment the `return;` statement in `/src/routes/api/seed/+server.ts`, then visit `/api/seed` endpoint. Remember to comment it back afterwards. Note that seeding is automatically disabled in production and only works in development environments.

## Architecture Overview

### Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Styling**: TailwindCSS with DaisyUI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PWA**: Vite PWA plugin with service worker support
- **Testing**: Vitest (unit), Playwright (e2e), Cucumber.js (BDD)
- **Deployment**: Netlify (hosted at pokedex.jcreek.co.uk)

### Core Data Models

- **PokedexEntry**: Core Pokémon data with regional pokédex numbers and catch information
- **UserPokedex**: User-created pokédex configurations supporting multiple regional pokédexes and challenge types
- **RegionalPokedex**: Metadata for different regional pokédex variants
- **CatchRecord**: Tracks caught Pokémon status per user pokédex

### Repository Pattern

The codebase uses a repository pattern in `src/lib/repositories/`:

- Database operations are abstracted through repository classes
- Each repository handles CRUD operations and data transformations
- Repositories convert between database snake_case and frontend camelCase

### State Management

- **Svelte stores** in `src/lib/stores/`:
  - `user.ts` - User authentication state
  - `currentPokedexStore.ts` - Active pokédex selection
- **Component-level state** for UI interactions

### API Structure

API routes in `src/routes/api/`:

- `/api/combined-data` - Aggregated pokédex and catch data
- `/api/combined-data/all` - Full dataset for comprehensive views
- `/api/pokedexes` - User pokédex management with stats endpoints
- `/api/pokedexes/[id]/stats` - Individual pokédex completion statistics
- `/api/catch-records` - Catch status tracking
- `/api/catch-records/batch` - Bulk catch record operations
- `/api/regional-pokedexes` - Regional pokédex metadata and configurations

### Database Naming Convention

- Database fields use snake_case (e.g., `user_id`, `created_at`)
- Frontend interfaces use camelCase (e.g., `userId`, `createdAt`)
- Repositories handle the conversion between conventions

### Component Organization

- `src/lib/components/` - Reusable UI components
- `src/lib/components/pokedex/` - Pokédex-specific components (list/box views, sidebar, entry records)
- `src/lib/components/pwa/` - Progressive Web App components (reload prompts)
- `src/routes/` - SvelteKit page components and API routes

### Key Features

- **Multi-pokédex support**: Users can create multiple pokédexes with different regional scopes
- **Challenge types**: Support for shiny hunting, origin requirements, and form variations
- **Responsive design**: Works on desktop and mobile with PWA capabilities
- **Real-time sync**: Supabase real-time subscriptions for live data updates

### Box View System

The unique **Box View** system mimics Pokémon game PC storage:

- Each box displays exactly 30 Pokémon in a 6×5 grid
- Supports 3-state catch system: not caught, caught, ready to evolve
- Bulk operations for catching/uncatching entire boxes
- Real-time visual feedback with sprites and status indicators

### BDD Testing Framework

Comprehensive Cucumber.js BDD tests in `features/` directory:

- **50+ scenarios** across 7 feature files covering all user journeys
- **Auto-authentication** with test user `test@livingdextracker.local`
- **data-testid selectors** for stable test automation (80+ implemented)
- **Smart test runner** that auto-starts Supabase and dev server
- **HTML reports** generated in `reports/` directory

### Development Notes

- All database migrations are in `supabase/migrations/`
- Sprite assets are stored in `static/sprites/home/` (sourced from PokéAPI under CC0 license)
- PWA configuration in `vite.config.ts` and `pwa.mjs`
- TypeScript strict mode enabled with comprehensive type definitions
- Service worker variants supported (with/without Node adapter)
- TailwindCSS compiled automatically during development
