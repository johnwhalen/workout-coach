# Golden Harbor Workout Coach - Claude Context

## Project Overview
Personal workout coaching PWA with AI-powered recommendations and progress tracking. Built with Next.js 14, Clerk authentication, Supabase PostgreSQL, and Claude AI for natural language workout logging.

## User Profile
- **Equipment**: Hydrow rowing machine (water resistance), adjustable bench (incline/flat/decline), dumbbells up to 55 lbs
- **Status**: Returning to training after 3-6 month break
- **Goals**: Build strength + general fitness
- **Frequency**: 2-3 days/week (full-body workouts)
- **Logging style**: Moderate detail (weight, reps, easy/hard feedback)

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Mantine UI, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase PostgreSQL
- **Auth**: Clerk v5
- **AI**: Claude API (Anthropic) via `@anthropic-ai/sdk`
- **Hosting**: Vercel

## Key Features
1. **AI Chat Interface**: Natural language workout logging ("I did 3 sets of bench press at 135lbs, 10 reps each")
2. **Workout Routines**: Pre-defined routines (Full Super A, 3-Day Full Body, etc.)
3. **Progress Tracking**: Metrics dashboard with charts
4. **PWA Support**: Installable on mobile devices
5. **Check-in System**: Pre-workout energy/sleep/soreness adjusts intensity

## Database Schema
```
User → Routine → Workout → Set
```
- **User**: Clerk user ID, fitness profile
- **Routine**: Named workout routines (e.g., "Full Super A")
- **Workout**: Exercise names within a routine (e.g., "Bench Press")
- **Set**: Individual set data (reps, weight, date, calories)

## Current State

### Working ✅
- Local development (`npm run dev` on http://localhost:3000)
- Chat streaming with Claude AI
- Workout logging via natural language
- Clerk authentication locally
- Database connection to Supabase
- Baseline data: Dec 31, 2025 workout with 24 sets
- 5 routines imported from Workouts.xlsx

### NOT Working ❌ - Vercel Deployment
- **500 MIDDLEWARE_INVOCATION_FAILED** on all routes
- Root cause: Corrupted Vercel environment variables

---

## CRITICAL ISSUE: Corrupted Environment Variables

The environment variables were added to Vercel using a script that incorrectly formatted the values:
```bash
echo -e "value\nn" | npx vercel env add VAR production
```

This added literal `\nn\n` characters to the end of each value. Visible in client-side HTML:
```
"publishableKey":"pk_test_Zm9uZC...\\nn\\n"
"signInUrl":"/login\\nn\\n"
```

---

## TO FIX VERCEL DEPLOYMENT

### Step 1: Fix Environment Variables (Vercel Dashboard)
1. Go to: https://vercel.com/jw-brilliantexps-projects/workout-coach/settings/environment-variables
2. **DELETE ALL** existing environment variables
3. Re-add each with CORRECT values (no trailing characters):

| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | `<from Clerk dashboard>` |
| CLERK_SECRET_KEY | `<from Clerk dashboard>` |
| NEXT_PUBLIC_CLERK_SIGN_IN_URL | `/login` |
| NEXT_PUBLIC_CLERK_SIGN_UP_URL | `/signup` |
| NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL | `/` |
| NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL | `/` |
| DATABASE_URL | `<from Supabase dashboard>` |
| DIRECT_URL | `<from Supabase dashboard>` |
| ANTHROPIC_API_KEY | `<from Anthropic console>` |

### Step 2: Restore Clerk Middleware
The middleware was temporarily disabled for debugging. Restore it in `middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/login(.*)", "/signup(.*)", "/"]);

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) {
        auth().protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
```

### Step 3: Deploy
```bash
cd workout-coach
npx vercel --prod
```

### Step 4: Test
1. Visit https://workout-coach-lyart.vercel.app
2. Should see login page or homepage
3. Test chat functionality
4. Test workout logging

---

## Key Files

### API Routes
- `app/api/handler-stream/route.ts` - Main chat endpoint with Claude AI
- `app/api/routine/displayroutines/route.ts` - Get user's routines
- `app/api/workouts/displayworkouts/route.ts` - Get workouts
- `app/api/sets/displaysets/route.ts` - Get logged sets

### Core Components
- `app/chat/page.tsx` - Chat interface with SSE streaming
- `app/page.tsx` - Homepage with workout summary
- `app/metrics/page.tsx` - Progress charts

### Configuration
- `middleware.ts` - Clerk authentication middleware (CURRENTLY DISABLED)
- `prisma/schema.prisma` - Database schema
- `.env` - Local environment variables (in .gitignore)
- `.vercelignore` - Files excluded from Vercel deployment

## Utility Scripts
- `scripts/summary.mjs` - Show database summary
- `scripts/reset-to-baseline.mjs` - Reset to Dec 31, 2025 baseline
- `scripts/cleanup-templates.mjs` - Remove empty template workouts

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio
- `npx vercel --prod` - Deploy to Vercel

## URLs
- **Vercel**: https://workout-coach-lyart.vercel.app (currently broken)
- **Local**: http://localhost:3000
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Supabase**: https://supabase.com/dashboard

## Recent Fixes Applied (This Session)
1. ✅ SSE streaming buffering (`\n\n` separator in chat/page.tsx)
2. ✅ Response message extraction (`result.message || result.response`)
3. ✅ Fuse.js undefined handling (default to "General Workout" and "Workout")
4. ✅ Removed .env from Vercel deploy via .vercelignore
5. ✅ Cleaned up empty template workouts
6. ✅ Reset database to Dec 31, 2025 baseline
7. ⏳ Vercel env vars need manual fix via dashboard

## Progressive Overload Logic
```
IF completed all target reps last session:
  - Suggest +2.5-5 lbs OR +1-2 reps
ELSE IF returning from break:
  - Start at 50% of last recorded weight
ELSE IF missed reps:
  - Maintain or reduce 5%

Apply check-in adjustment:
  - Tired: -10-20%
  - Great: can push +5%
```

## Related Files
- [Workouts.xlsx](../Workouts.xlsx) - User's historical workout data
