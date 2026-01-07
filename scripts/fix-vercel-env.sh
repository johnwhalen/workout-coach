#!/bin/bash
# Fix Vercel environment variables by removing and re-adding them properly

cd "$(dirname "$0")/.."

# Read values from .env file (values only, no trailing newlines)
PUBLISHABLE_KEY="pk_test_Zm9uZC1tdXNrcmF0LTgyLmNsZXJrLmFjY291bnRzLmRldiQ"
SECRET_KEY="sk_test_WwJfOn9TYhILl3K4NgJr6hH6KwG2BytPAgphXM1ynA"

# Remove old vars (will prompt for confirmation in terminal)
echo "Removing old environment variables..."
echo "Please answer 'y' when prompted for each variable"

vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env rm NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env rm NEXT_PUBLIC_CLERK_SIGN_UP_URL production
vercel env rm NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
vercel env rm NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
vercel env rm CLERK_SECRET_KEY production

echo ""
echo "Now adding correct environment variables..."
echo "Please enter the values when prompted"
echo ""

echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY..."
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

echo "Adding CLERK_SECRET_KEY..."
vercel env add CLERK_SECRET_KEY production

echo "Adding NEXT_PUBLIC_CLERK_SIGN_IN_URL..."
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production

echo "Adding NEXT_PUBLIC_CLERK_SIGN_UP_URL..."
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production

echo "Adding NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL..."
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production

echo "Adding NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL..."
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production

echo ""
echo "Done! Listing all env vars:"
vercel env ls production
