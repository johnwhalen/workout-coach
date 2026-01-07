# Workout Coach - Setup Guide

Follow these steps to set up all required services.

---

## Step 1: Anthropic (Claude AI)

Claude powers the AI coaching features - workout recommendations, check-ins, and fitness Q&A.

### Create Account & Get API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click "Sign Up" (or "Log In" if you have an account)
3. After logging in, go to **Settings → API Keys**
4. Click **"Create Key"**
5. Name it "Workout Coach"
6. Copy the key (starts with `sk-ant-api03-...`)

### Add to Environment

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Cost Estimate

- Claude Sonnet: ~$3 per million input tokens
- Typical workout check-in: ~500 tokens
- **Expected monthly cost**: $1-5 depending on usage

---

## Step 2: Clerk (Authentication)

Clerk handles user login/signup so your workout data stays private.

### Create Account & App

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click "Sign Up" (free account)
3. Click **"Create Application"**
4. Name it "Workout Coach"
5. Enable authentication methods:
   - ✅ Email
   - ✅ Google (optional but convenient)
   - ✅ Apple (optional)
6. Click **"Create Application"**

### Get Your Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy both keys:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

### Add to Environment

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
CLERK_SECRET_KEY=sk_test_your-key-here

# These are the redirect URLs (keep as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Cost

- **Free tier**: 10,000 monthly active users
- More than enough for personal use!

---

## Step 3: Supabase (Database)

Supabase is a free PostgreSQL database that stores your workout data.

### Create Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up with GitHub is fastest)
3. Click **"New Project"**
4. Fill in:
   - **Name**: "workout-coach"
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 1-2 minutes for project to initialize

### Get Connection String

1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection String** section
3. Select **URI** format
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### Add to Environment

```bash
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.xxxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR-PASSWORD@db.xxxx.supabase.co:5432/postgres"
```

### Cost

- **Free tier**: 500MB database, 2 projects
- More than enough for years of workout data!

---

## Step 4: Create Your .env.local File

1. In the `workout-coach` folder, create a file called `.env.local`
2. Add all your keys:

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.xxxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR-PASSWORD@db.xxxx.supabase.co:5432/postgres"
```

---

## Step 5: Initialize Database

After adding your environment variables, run:

```bash
cd workout-coach
npm install
npx prisma migrate dev --name init
```

This creates the database tables for users, routines, workouts, and sets.

---

## Step 6: Start the App

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser!

---

## Troubleshooting

### "Invalid API Key" errors

- Double-check you copied the full key (no extra spaces)
- Make sure the key is in `.env.local` not `.env`

### Database connection errors

- Verify your Supabase project is fully initialized (green status)
- Check that you replaced `[YOUR-PASSWORD]` with your actual password
- Ensure there are no special characters in password that need escaping

### Clerk sign-in not working

- Check both keys are correct (publishable AND secret)
- Verify the redirect URLs match your app routes

---

## Estimated Setup Time

- **Total**: ~15-20 minutes
- Anthropic: 2-3 minutes
- Clerk: 3-5 minutes
- Supabase: 5-7 minutes
- Environment setup: 5 minutes

---

## Need Help?

If you get stuck, let me know in Claude Code and I can help troubleshoot!
