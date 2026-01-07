#!/bin/bash

# Fix Vercel Environment Variables
# This script removes corrupted env vars and prompts for new values
#
# Usage: ./fix-vercel-env.sh
# Note: You'll be prompted to enter values interactively

set -e

cd "$(dirname "$0")/../.."

echo "🔧 Fixing Vercel Environment Variables"
echo "======================================="
echo ""
echo "This script will remove and re-add environment variables."
echo "You will be prompted to enter each value securely."
echo ""

# List of environment variables to fix
VARS=(
    "ANTHROPIC_API_KEY"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL"
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL"
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"
    "DATABASE_URL"
    "DIRECT_URL"
)

echo "Step 1: Removing existing (corrupted) environment variables..."
echo ""

for VAR in "${VARS[@]}"; do
    echo "  Removing $VAR..."
    # Auto-confirm removal, suppress errors if var doesn't exist
    yes y | npx vercel env rm "$VAR" production 2>/dev/null || true
done

echo ""
echo "Step 2: Adding environment variables..."
echo "Please enter values when prompted (they will be read securely)"
echo ""

# Non-sensitive variables with default values
echo "  Adding NEXT_PUBLIC_CLERK_SIGN_IN_URL..."
printf '%s' '/login' | npx vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production

echo "  Adding NEXT_PUBLIC_CLERK_SIGN_UP_URL..."
printf '%s' '/signup' | npx vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production

echo "  Adding NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL..."
printf '%s' '/' | npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production

echo "  Adding NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL..."
printf '%s' '/' | npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production

# Sensitive variables - prompt user
echo ""
echo "Now enter the sensitive values. Get these from your .env.local file."
echo ""

SENSITIVE_VARS=(
    "ANTHROPIC_API_KEY"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "DATABASE_URL"
    "DIRECT_URL"
)

for VAR in "${SENSITIVE_VARS[@]}"; do
    echo "  Adding $VAR (enter value and press Enter):"
    npx vercel env add "$VAR" production
done

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Verifying..."
npx vercel env ls production

echo ""
echo "Step 3: Now deploy to production with:"
echo "  npx vercel --prod"
echo ""
