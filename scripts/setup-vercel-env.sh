#!/bin/bash
# Setup Vercel environment variables

cd "$(dirname "$0")/.."

# Add each env variable - piping value and answering 'n' to sensitive prompt
echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY..."
echo -e "pk_test_Zm9uZC1tdXNrcmF0LTgyLmNsZXJrLmFjY291bnRzLmRldiQ\nn" | npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

echo "Adding CLERK_SECRET_KEY..."
echo -e "sk_test_WwJfOn9TYhILl3K4NgJr6hH6KwG2BytPAgphXM1ynA\nn" | npx vercel env add CLERK_SECRET_KEY production

echo "Adding NEXT_PUBLIC_CLERK_SIGN_IN_URL..."
echo -e "/login\nn" | npx vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production

echo "Adding NEXT_PUBLIC_CLERK_SIGN_UP_URL..."
echo -e "/signup\nn" | npx vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production

echo "Adding NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL..."
echo -e "/\nn" | npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production

echo "Adding NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL..."
echo -e "/\nn" | npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production

echo "Adding DATABASE_URL..."
echo -e "postgresql://postgres:dfj0txt_jeu4ufm!ZFN@db.zedzfledbegmswzfeisd.supabase.co:5432/postgres\nn" | npx vercel env add DATABASE_URL production

echo "Adding DIRECT_URL..."
echo -e "postgresql://postgres:dfj0txt_jeu4ufm!ZFN@db.zedzfledbegmswzfeisd.supabase.co:5432/postgres\nn" | npx vercel env add DIRECT_URL production

echo "Done! Listing all env vars:"
npx vercel env ls
