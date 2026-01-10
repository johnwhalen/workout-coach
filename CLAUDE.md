# Golden Harbor Workout Coach

Personal workout coaching PWA with AI-powered recommendations and progress tracking.

## Quick Start

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npx prisma studio        # Database UI
npx prisma migrate dev   # Run migrations
npx vercel --prod        # Deploy to Vercel
```

## Development Workflow

### Before Committing (Automatic)

Pre-commit hooks run automatically:

1. Prettier formats changed files
2. ESLint checks for errors
3. Commit blocked if errors found

### Before Deploying

```bash
npm run preflight        # Runs lint + typecheck + build
npm run test:manual      # Run comprehensive tests
npx vercel --prod        # Deploy to production
```

### Code Quality Commands

| Command                    | Description                      |
| -------------------------- | -------------------------------- |
| `npm run lint`             | Check for lint errors            |
| `npm run lint:fix`         | Auto-fix lint errors             |
| `npm run format`           | Format all code with Prettier    |
| `npm run format:check`     | Check formatting without changes |
| `npm run typecheck`        | Run TypeScript type checking     |
| `npm run preflight`        | Full check: lint + types + build |
| `npm run test:manual`      | Run comprehensive manual tests   |
| `npx playwright test`      | Run E2E tests                    |
| `npx playwright test --ui` | Run E2E tests with UI            |

### CI/CD

GitHub Actions runs on every push/PR to main:

- Linting
- TypeScript checking
- Production build verification

## Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript, Mantine UI, Tailwind CSS |
| Backend  | Next.js API Routes, Prisma ORM                                |
| Database | Supabase PostgreSQL                                           |
| Auth     | Clerk v5                                                      |
| AI       | Claude API via Vercel AI SDK (`@ai-sdk/anthropic`)            |
| Hosting  | Vercel                                                        |

## Project Structure

```
app/
├── api/
│   ├── chat/              # Main chat endpoint (SSE streaming)
│   ├── routines/          # GET user routines
│   ├── workouts/          # POST workouts by routine, GET by date
│   ├── sets/              # POST sets by workout
│   ├── users/             # User management
│   │   ├── route.ts       # POST create/get user
│   │   ├── profile/       # GET/POST fitness profile
│   │   └── history/       # GET/POST chat history
│   ├── calories/          # Calorie calculations
│   └── import/            # Data import
├── chat/                  # Chat interface
├── metrics/               # Progress dashboard
└── page.tsx               # Homepage

components/
├── common/                # Shared components (ErrorBoundary)
├── modals/                # Modal components (FitnessProfileModal)
└── branding/              # Branding (GoldenHarborCrest)

lib/
├── ai/                    # AI processing (modular)
│   ├── index.ts           # Public exports
│   ├── processor.ts       # processWithAI function
│   ├── prompts.ts         # System prompts
│   ├── intensity.ts       # Intensity calculations
│   └── history.ts         # Chat history helpers
├── db/                    # Database helpers (future)
└── utils/
    └── rate-limit.ts      # Rate limiting

types/
├── index.ts               # Re-exports all types
├── ai.ts                  # AI types (ParsedAction, WorkoutSet, etc.)
├── api.ts                 # API types (ChatRequest, ChatStreamEvent)
└── database.ts            # Database types (User, Routine, Workout, Set)

hooks/                     # Custom React hooks (future)

prisma/
├── schema.prisma          # Database schema
└── prisma.ts              # Prisma client singleton

scripts/
├── db/                    # Database utilities
│   ├── summary.mjs        # Show database summary
│   ├── reset-to-baseline.mjs
│   └── cleanup-templates.mjs
├── import/                # Data import scripts
│   ├── import-workouts.mjs
│   └── add-routine-templates.mjs
├── deploy/                # Deployment scripts
│   ├── setup-vercel-env.sh
│   └── fix-vercel-env.sh
└── test/                  # Test scripts
    └── test-app.mjs

tests/
└── e2e/                   # Playwright E2E tests
    ├── *.spec.ts          # Unauthenticated tests
    ├── *.authenticated.spec.ts  # Authenticated tests
    ├── auth.setup.ts      # Clerk auth setup
    ├── global.setup.ts    # Clerk testing tokens
    └── fixtures/          # Test helpers and data
```

## API Endpoints

| Endpoint                | Method   | Description                         |
| ----------------------- | -------- | ----------------------------------- |
| `/api/chat`             | POST     | Main chat interface (SSE streaming) |
| `/api/routines`         | GET      | Get user's routines                 |
| `/api/workouts`         | POST     | Get workouts for a routine          |
| `/api/workouts/by-date` | GET      | Get workouts by date                |
| `/api/sets`             | POST     | Get sets for a workout              |
| `/api/users`            | POST     | Create/get current user             |
| `/api/users/profile`    | GET/POST | Fitness profile                     |
| `/api/users/history`    | GET/POST | Chat history                        |
| `/api/calories`         | POST     | Calculate calories                  |
| `/api/import`           | GET/POST | Import workout data                 |

## Database Schema

See @prisma/schema.prisma for full schema.

```
User → Routine → Workout → Set
```

- **User**: Clerk user ID, fitness profile
- **Routine**: Named workout routines (e.g., "Full Super A")
- **Workout**: Exercise names within a routine
- **Set**: Individual set data (reps, weight, date)

## Adding Features

1. Create API route in `app/api/`
2. Add Prisma model if needed (`npx prisma migrate dev`)
3. Create UI component in `app/` or `components/`
4. Test locally with `npm run dev`
5. Run `npm run preflight` before deploying
6. Deploy with `npx vercel --prod`

### Debugging

- Browser console for client errors
- Terminal for server errors
- `npx prisma studio` to inspect data
- Check `/api/chat` network requests

### Database Tasks

| Task              | Command                                 |
| ----------------- | --------------------------------------- |
| View database     | `npx prisma studio`                     |
| Reset to baseline | `node scripts/db/reset-to-baseline.mjs` |
| Show DB summary   | `node scripts/db/summary.mjs`           |

## User Profile

- **Equipment**: Hydrow rowing machine, adjustable bench (incline/flat/decline), dumbbells up to 55 lbs
- **Status**: Returning to training after break
- **Goals**: Build strength + general fitness
- **Frequency**: 2-3 days/week (full-body workouts)

## Key Features

1. **AI Chat**: Natural language workout logging
2. **Routines**: Pre-defined workout routines
3. **Progress Tracking**: Metrics dashboard with charts
4. **PWA Support**: Installable on mobile
5. **Check-in System**: Energy/sleep/soreness adjusts recommendations

## Modular Rules

Path-specific coding standards in `.claude/rules/`:

- [api-design.md](.claude/rules/api-design.md) - API route standards
- [prisma-patterns.md](.claude/rules/prisma-patterns.md) - Database patterns
- [streaming.md](.claude/rules/streaming.md) - SSE streaming patterns
- [testing.md](.claude/rules/testing.md) - Testing standards

## Custom Skills

Domain-specific capabilities in `.claude/skills/`:

- **workout-logging** - Parse natural language workout entries
- **progressive-overload** - Calculate weight/rep progressions
- **routine-builder** - Create/modify workout routines
- **metrics-analysis** - Analyze workout trends

## External Links

| Service  | URL                                    |
| -------- | -------------------------------------- |
| Vercel   | https://workout-coach-lyart.vercel.app |
| Local    | http://localhost:3000                  |
| Clerk    | https://dashboard.clerk.com            |
| Supabase | https://supabase.com/dashboard         |

---

## Current Status

### Working

- Local development
- Chat streaming with Claude AI
- Workout logging via natural language
- Clerk authentication
- Database connection

### Known Issues

- **Vercel Deployment**: Environment variables need manual fix
  - See [SETUP.md](SETUP.md) for deployment instructions

## Progressive Overload Logic

```
IF completed all target reps:
  → Suggest +2.5-5 lbs OR +1-2 reps
ELSE IF returning from break:
  → Start at 50-90% based on break duration
ELSE IF missed reps:
  → Maintain or reduce 5%

Check-in adjustments:
  - Tired: -10-20%
  - Great: +5%
```
