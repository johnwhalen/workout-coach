# Golden Harbor Workout Coach - Product Requirements Document (PRD)

**Version:** 2.0 (Fresh Build)
**Date:** January 10, 2026
**Status:** Planning

---

## Executive Summary

Golden Harbor Workout Coach is a family-friendly, AI-powered workout coaching Progressive Web App (PWA) designed for home gym users. The application enables multiple household members to track their individual fitness journeys while sharing gym equipment. It uses natural language and voice input to log workouts, provides intelligent progressive overload recommendations, and motivates users through gamification and persuasive design.

This is a **fresh build** using Supabase for both database and authentication.

---

## 1. Product Vision

### Mission

Provide an intelligent, conversational workout coach that makes strength training accessible, personalized, and progressively challenging for every member of a household.

### Target Users

- **Primary**: Households with home gyms where multiple family members want to track their own fitness
- **Secondary**: Individuals returning to strength training after a break
- **Tertiary**: Fitness enthusiasts who want AI-assisted workout logging and recommendations

### Core Value Propositions

1. **Multi-User Household Support** - Each family member has their own profile, stats, and progress
2. **Configurable Equipment** - Define your gym's equipment once, available to all household members
3. **Natural Language & Voice Logging** - "I did 3 sets of bench at 25 lbs" via text or speech
4. **Session-Based Workouts** - See your routine, check off exercises, adjust reps/weight in real-time
5. **Smart Recommendations** - AI-driven progressive overload based on individual history
6. **Gamification** - Badges, streaks, and achievements to keep everyone motivated
7. **Reusable Routines** - Save and reuse workout templates

---

## 2. Feature Requirements

### 2.1 Core Features (MVP)

#### Authentication & User Management

| Feature             | Priority | Description                                          |
| ------------------- | -------- | ---------------------------------------------------- |
| Supabase Auth       | P0       | Email/password login, optional magic links           |
| Household accounts  | P0       | Multiple users sharing one "gym"                     |
| Individual profiles | P0       | Each user has own stats, history, goals              |
| Profile onboarding  | P0       | Weight, height, goals, experience level              |
| User switching      | P1       | Easy switch between family members on shared devices |

#### Household & Equipment Management

| Feature              | Priority | Description                                                   |
| -------------------- | -------- | ------------------------------------------------------------- |
| Household creation   | P0       | Create a household with shared equipment                      |
| Equipment inventory  | P0       | Define available equipment (dumbbells, bench, machines, etc.) |
| Add/remove equipment | P0       | Update gym inventory as equipment changes over time           |
| Equipment categories | P1       | Cardio, free weights, machines, bodyweight, etc.              |
| Join household       | P1       | Invite family members via code or link                        |

#### Workout Routines

| Feature                  | Priority | Description                                     |
| ------------------------ | -------- | ----------------------------------------------- |
| Routine templates        | P0       | Create reusable workout routines                |
| Exercise list in routine | P0       | See all exercises for a session before starting |
| Routine library          | P0       | Browse and select from saved routines           |
| Clone/edit routines      | P1       | Copy and modify existing routines               |
| AI-suggested routines    | P2       | Generate routines based on goals and equipment  |

#### Active Workout Session

| Feature         | Priority | Description                                        |
| --------------- | -------- | -------------------------------------------------- |
| Session view    | P0       | Display current routine with exercises to complete |
| Quick logging   | P0       | Tap to log set, adjust reps/weight inline          |
| Set completion  | P0       | Check off sets as completed                        |
| Rest timer      | P1       | Optional rest timer between sets                   |
| Session summary | P0       | Review completed workout before saving             |
| Voice input     | P1       | Log sets via voice commands                        |

#### AI Chat Interface

| Feature                       | Priority | Description                                 |
| ----------------------------- | -------- | ------------------------------------------- |
| Natural language logging      | P0       | "I did 3x10 bench at 135" → structured data |
| Voice-to-text input           | P1       | Speak workout entries                       |
| SSE streaming responses       | P0       | Real-time AI responses                      |
| Context-aware recommendations | P0       | AI knows your equipment and history         |
| Fitness Q&A                   | P1       | Ask questions about form, nutrition, etc.   |

#### Progress Tracking

| Feature            | Priority | Description                     |
| ------------------ | -------- | ------------------------------- |
| Personal dashboard | P0       | Individual stats and progress   |
| Strength charts    | P0       | Progress over time per exercise |
| Workout history    | P0       | Browse past workouts by date    |
| Calendar view      | P1       | Visual workout frequency        |

#### Gamification & Motivation

| Feature                  | Priority | Description                               |
| ------------------------ | -------- | ----------------------------------------- |
| Streak tracking          | P0       | Consecutive workout days/weeks            |
| Badges/achievements      | P0       | Earn badges for milestones                |
| Personal records         | P0       | Celebrate new PRs                         |
| Progress celebrations    | P1       | Animations/notifications for achievements |
| Weekly goals             | P1       | Set and track weekly workout targets      |
| Leaderboards (household) | P2       | Optional friendly competition             |

#### Check-in System

| Feature              | Priority | Description                                  |
| -------------------- | -------- | -------------------------------------------- |
| Pre-workout check-in | P1       | Energy, sleep, soreness (1-5)                |
| Intensity adjustment | P1       | AI adjusts recommendations based on check-in |

### 2.2 Future Features (Post-MVP)

| Feature                        | Priority | Description                                   |
| ------------------------------ | -------- | --------------------------------------------- |
| Native mobile apps             | P1       | iOS and Android apps for App Store/Play Store |
| Apple Health / Google Fit sync | P2       | Import/export health data                     |
| Nutrition tracking             | P3       | Macros and calorie tracking                   |
| 1RM predictions                | P2       | Estimated one-rep max calculations            |
| Workout sharing                | P3       | Share routines with friends                   |
| Form video library             | P2       | Embedded exercise demos                       |
| Offline mode                   | P1       | Log workouts offline, sync later              |
| Apple Watch companion          | P3       | Quick logging from wrist                      |
| In-app purchases               | P1       | Subscription tiers for monetization           |

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer                | Technology                                    | Notes                              |
| -------------------- | --------------------------------------------- | ---------------------------------- |
| **Frontend**         | Next.js 14+ (App Router), TypeScript          | Server components, streaming       |
| **UI Framework**     | TBD (Mantine, shadcn/ui, or Tailwind)         | Open to change                     |
| **State Management** | React Query or SWR                            | Server state caching               |
| **Backend**          | Next.js API Routes or Supabase Edge Functions | Serverless                         |
| **Database**         | Supabase PostgreSQL                           | With Row Level Security            |
| **Authentication**   | Supabase Auth                                 | Email/password, magic links, OAuth |
| **AI**               | Claude API via Vercel AI SDK                  | Streaming responses                |
| **Voice Input**      | Web Speech API                                | Browser-native speech recognition  |
| **Hosting**          | Vercel                                        | Edge deployment                    |
| **Testing**          | Vitest + Playwright                           | Unit, integration, E2E             |

### 3.2 Database Schema (Proposed)

```
Household
├── id (uuid, PK)
├── name (string)
├── created_at
└── invite_code (string, unique)

Equipment
├── id (uuid, PK)
├── household_id (FK → Household)
├── name (string) - e.g., "Adjustable Dumbbells"
├── category (enum) - cardio, free_weights, machines, bodyweight, other
├── details (jsonb) - e.g., { "max_weight": 55, "unit": "lbs" }
└── created_at

User
├── id (uuid, PK) - matches Supabase Auth user ID
├── household_id (FK → Household, nullable)
├── email (string)
├── display_name (string)
├── current_weight, height, goal_weight (floats)
├── fitness_goal (enum)
├── experience_level (enum)
├── profile_complete (boolean)
├── created_at, updated_at
└── role (enum) - owner, member

RoutineTemplate
├── id (uuid, PK)
├── user_id (FK → User) - who created it
├── household_id (FK → Household, nullable) - shared with household?
├── name (string)
├── description (string?)
├── exercises (jsonb) - ordered list of exercises with target sets/reps
├── is_shared (boolean) - visible to household members
└── created_at, updated_at

WorkoutSession
├── id (uuid, PK)
├── user_id (FK → User)
├── routine_template_id (FK → RoutineTemplate, nullable)
├── started_at (timestamp)
├── completed_at (timestamp, nullable)
├── duration_minutes (int)
├── notes (string?)
├── check_in (jsonb) - { energy, sleep, soreness }
└── created_at

ExerciseLog
├── id (uuid, PK)
├── workout_session_id (FK → WorkoutSession)
├── exercise_name (string)
├── order_index (int)
└── notes (string?)

SetLog
├── id (uuid, PK)
├── exercise_log_id (FK → ExerciseLog)
├── set_number (int)
├── target_reps (int?)
├── actual_reps (int)
├── target_weight (float?)
├── actual_weight (float)
├── completed (boolean)
├── created_at

Badge
├── id (uuid, PK)
├── name (string)
├── description (string)
├── icon (string)
├── criteria (jsonb) - rules for earning
└── category (enum) - streak, strength, consistency, milestone

UserBadge
├── id (uuid, PK)
├── user_id (FK → User)
├── badge_id (FK → Badge)
├── earned_at (timestamp)
└── details (jsonb) - context about how earned

UserStreak
├── id (uuid, PK)
├── user_id (FK → User)
├── current_streak (int)
├── longest_streak (int)
├── last_workout_date (date)
└── updated_at

ChatHistory
├── id (uuid, PK)
├── user_id (FK → User)
├── messages (jsonb[])
└── updated_at
```

### 3.3 Key Relationships

```
Household (1) ──→ (many) User
Household (1) ──→ (many) Equipment
User (1) ──→ (many) RoutineTemplate
User (1) ──→ (many) WorkoutSession
WorkoutSession (1) ──→ (many) ExerciseLog
ExerciseLog (1) ──→ (many) SetLog
User (1) ──→ (many) UserBadge
Badge (1) ──→ (many) UserBadge
```

### 3.4 Row Level Security (RLS) Policies

```sql
-- Users can only see their own data
-- Users can see household members (for leaderboards)
-- Users can see shared routines in their household
-- Equipment is visible to all household members
```

---

## 4. User Experience

### 4.1 Key User Flows

#### Flow 1: New User Onboarding

1. Sign up with email/password
2. Create household OR join existing (via invite code)
3. Complete fitness profile (weight, height, goals)
4. Add equipment to household (if owner)
5. Create first routine or use AI to generate one
6. Start first workout

#### Flow 2: Starting a Workout Session

1. Select routine from library
2. See full exercise list with target sets/reps
3. Optional: Complete check-in (energy, sleep, soreness)
4. For each exercise:
   - See target sets/reps/weight (based on history + progression)
   - Log actual performance (tap or voice)
   - Mark set complete
5. Review session summary
6. Save workout → see any badges earned

#### Flow 3: Voice Logging (Mid-Workout)

1. Tap microphone button
2. Say: "Bench press, 10 reps at 135 pounds"
3. AI confirms and logs the set
4. Continue workout

#### Flow 4: Family Member Joining

1. Receive invite code/link from household owner
2. Sign up or log in
3. Enter invite code
4. Complete personal profile
5. Access shared equipment and routines

### 4.2 Session View Mockup (Conceptual)

```
┌─────────────────────────────────────┐
│ 💪 Full Body A          [End Early] │
├─────────────────────────────────────┤
│ ✅ Bench Press                      │
│    Set 1: 10 × 135 lbs ✓            │
│    Set 2: 10 × 135 lbs ✓            │
│    Set 3: 8 × 135 lbs ✓             │
├─────────────────────────────────────┤
│ 🔄 Dumbbell Rows (In Progress)      │
│    Set 1: [10] × [45] lbs  [Log]    │
│    Set 2: __ × __ lbs               │
│    Set 3: __ × __ lbs               │
├─────────────────────────────────────┤
│ ⏳ Shoulder Press                    │
│    3 sets × 10 reps @ 30 lbs        │
├─────────────────────────────────────┤
│ ⏳ Bicep Curls                       │
│    3 sets × 12 reps @ 25 lbs        │
├─────────────────────────────────────┤
│         [🎤 Voice Log]              │
└─────────────────────────────────────┘
```

---

## 5. Gamification Design

### 5.1 Badge Categories

#### Streak Badges

| Badge            | Criteria                      |
| ---------------- | ----------------------------- |
| First Steps      | Complete first workout        |
| Week Warrior     | 3 workouts in one week        |
| Consistency King | 4 weeks with 3+ workouts each |
| Iron Will        | 30-day workout streak         |
| Century Club     | 100 total workouts            |

#### Strength Badges

| Badge           | Criteria                                    |
| --------------- | ------------------------------------------- |
| Personal Record | Set a new PR on any exercise                |
| Double Up       | Double your starting weight on any exercise |
| Heavy Hitter    | Log a set over 100 lbs                      |
| Rep Master      | Complete 100 reps in a single session       |

#### Progress Badges

| Badge            | Criteria                    |
| ---------------- | --------------------------- |
| Profile Complete | Fill out all profile fields |
| Routine Builder  | Create 5 custom routines    |
| Early Bird       | Log a workout before 7 AM   |
| Night Owl        | Log a workout after 9 PM    |
| Comeback Kid     | Return after 2+ week break  |

### 5.2 Motivation Mechanics

- **Streak protection**: Miss a day? AI offers encouragement, not punishment
- **PR celebrations**: Special animation when hitting personal records
- **Weekly recaps**: Summary of progress and badges earned
- **Gentle nudges**: "You usually work out on Tuesdays. Ready to go?"
- **Progress comparisons**: "You're 15% stronger than last month!"

---

## 6. Progressive Overload Logic

### 6.1 Algorithm (Retained from v1)

```
IF completed all target reps:
  → Suggest +2.5-5 lbs OR +1-2 reps (max 10% weekly increase)

ELSE IF returning from break (2+ weeks):
  → Start at 50-70% of previous max
  → Weekly progression: gradual return over 2-3 weeks

ELSE IF missed reps significantly:
  → Maintain weight or reduce 5%
```

### 6.2 Check-in Adjustments

```
Base intensity: 1.0

Modifiers:
  - Energy ≤ 2: -15%
  - Energy ≥ 4: +5%
  - Sleep ≤ 2: -10%
  - Sleep ≥ 4: +2%
  - Soreness ≥ 4: -10%
  - Soreness ≤ 2: +2%

Final range: 0.7x - 1.1x (clamped)
```

---

## 7. Voice Input Design

### 7.1 Supported Commands

| Command Pattern                              | Action                              |
| -------------------------------------------- | ----------------------------------- |
| "[Exercise], [reps] reps at [weight] pounds" | Log a set                           |
| "Done with [exercise]"                       | Mark exercise complete              |
| "Skip [exercise]"                            | Skip current exercise               |
| "Add a set"                                  | Add another set to current exercise |
| "How am I doing?"                            | Get AI progress summary             |
| "What's next?"                               | Hear next exercise                  |

### 7.2 Implementation Approach

1. Use Web Speech API for browser-native recognition
2. Send transcribed text to AI for intent parsing
3. Confirm action with visual + audio feedback
4. Allow manual correction if misheard

---

## 8. Success Metrics

| Metric                  | Target                 | Notes                |
| ----------------------- | ---------------------- | -------------------- |
| Household adoption      | 2+ users per household | Multi-user value     |
| Weekly active workouts  | 2-3 per user           | Core engagement      |
| Routine reuse rate      | >50%                   | Template value       |
| Session completion rate | >80%                   | Started vs finished  |
| Voice usage             | >20% of logs           | Voice adoption       |
| Badge engagement        | 5+ badges per user     | Gamification working |
| 30-day retention        | >60%                   | Sticky product       |

---

## 9. Open Questions

### Technical Decisions

1. **UI Framework**: Stick with Mantine, switch to shadcn/ui, or pure Tailwind?
2. **Supabase vs Prisma**: Use Supabase client directly or keep Prisma as ORM layer?
3. **Real-time features**: Use Supabase Realtime for household activity feed?

### Product Decisions

4. **Household limits**: Max users per household? (Free vs paid tiers?)
5. **Equipment presets**: Offer common equipment bundles (e.g., "Basic Home Gym")?
6. **Routine sharing**: Allow sharing routines outside household (public library)?
7. **AI model**: Stay with Claude Sonnet 4 or consider alternatives for cost?

### Future Considerations

8. **Monetization**: Free forever? Freemium? Subscription tiers?
9. **Data portability**: Export formats for user data?
10. **Accessibility**: Screen reader support, high contrast mode?

---

## 10. Development Phases

### Phase 1: Foundation

- Supabase project setup
- Auth flows (signup, login, password reset)
- Household and equipment management
- Basic user profiles
- Database schema and RLS policies

### Phase 2: Core Workout Features

- Routine template CRUD
- Active workout session UI
- Set logging (tap interface)
- Workout history and calendar
- Basic progress charts

### Phase 3: AI Integration

- Chat interface with Claude
- Natural language workout parsing
- Context-aware recommendations
- Progressive overload suggestions

### Phase 4: Voice & Gamification

- Voice input integration
- Badge system
- Streak tracking
- PR celebrations
- Weekly summaries

### Phase 5: Polish & PWA

- Performance optimization
- PWA enhancements (offline, install prompts)
- Comprehensive testing
- Mobile-responsive refinements

### Phase 6: Native Apps & Monetization

- React Native or Expo app build
- iOS App Store submission
- Google Play Store submission
- Subscription tier implementation (RevenueCat or similar)
- Apple Health / Google Fit integration

---

## 11. Mobile & Monetization Strategy

### 11.1 Mobile Approach

| Option                  | Pros                                                 | Cons                                            |
| ----------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| **PWA First**           | Single codebase, faster to market, no app store fees | Limited native features, no App Store presence  |
| **React Native / Expo** | Native feel, App Store distribution, shared codebase | Additional build complexity, app review process |
| **Capacitor**           | Wrap existing web app, minimal code changes          | Performance concerns, "web in a wrapper" feel   |

**Recommended**: Start with a **mobile-optimized PWA**, then build **React Native / Expo** apps for App Store distribution once core features are validated.

### 11.2 App Store Considerations

- **Apple App Store**: 15-30% commission on subscriptions
- **Google Play Store**: 15% commission (first $1M), 30% after
- **App Review**: Plan for 1-2 week review cycles, follow guidelines strictly
- **Privacy Policy**: Required for both stores
- **Terms of Service**: Required for subscriptions

### 11.3 Subscription Model (Proposed)

| Tier                 | Price     | Features                                         |
| -------------------- | --------- | ------------------------------------------------ |
| **Free**             | $0        | 1 user, basic logging, limited history (30 days) |
| **Household**        | $9.99/mo  | Unlimited users, full history, all features      |
| **Household Annual** | $79.99/yr | Same as monthly, 33% savings                     |

### 11.4 Technical Requirements for App Store

- **Offline support**: Must work without internet (queue syncs)
- **Deep linking**: Support for shared routine links
- **Push notifications**: Workout reminders, streak alerts
- **In-app purchases**: RevenueCat or native StoreKit/Billing integration
- **Analytics**: Track user engagement for retention optimization
- **Crash reporting**: Sentry or similar for stability monitoring

---

## 12. Reference: Lessons from v1

### What Worked Well

- Natural language logging via AI
- Check-in system for intensity adjustment
- Streaming responses for good UX
- Service layer architecture (clean separation)
- Comprehensive testing setup

### What Needs Improvement

- **Session view**: v1 lacked a clear "here's your workout, check off as you go" interface
- **Routine visibility**: Hard to see what exercises were in a routine before starting
- **Equipment flexibility**: Was hardcoded to one user's equipment
- **Single user**: No support for household/family
- **Motivation**: Limited gamification beyond basic streaks

---

_This document defines the requirements for Golden Harbor Workout Coach v2.0 - a fresh build focused on multi-user households, improved workout session UX, voice control, and gamification._
