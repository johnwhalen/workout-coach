---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "tests/**/*"
---

# Testing Standards

## Test Structure

- Place unit tests adjacent to source files or in `__tests__` directories
- Place E2E tests in `tests/e2e/`
- Name test files as `{component}.test.tsx` or `{module}.test.ts`
- Name E2E specs as `{feature}.spec.ts` (unauthenticated) or `{feature}.authenticated.spec.ts`
- Group related tests with `describe` blocks
- Use clear, descriptive test names

## Testing Priorities

1. **API Routes**: Test auth, validation, response formats
2. **AI Processing**: Test parsing, intent detection, data extraction
3. **Database Operations**: Test CRUD operations, relationships
4. **UI Components**: Test user interactions, state changes

## E2E Testing with Playwright

### Test Organization

```
tests/e2e/
├── *.spec.ts                  # Unauthenticated tests (run without login)
├── *.authenticated.spec.ts    # Authenticated tests (require Clerk session)
├── auth.setup.ts              # Signs in and saves session state
├── global.setup.ts            # Gets Clerk testing tokens
└── fixtures/
    └── auth.ts                # Auth helpers and test data
```

### Running E2E Tests

```bash
npx playwright test                          # Run all tests
npx playwright test --project=chromium       # Run unauthenticated only
npx playwright test chat.authenticated       # Run specific spec
npx playwright test --ui                     # Interactive UI mode
```

### Enabling Authenticated Tests

1. Create a test user in your Clerk dashboard
2. Add to `.env.local`:
   ```
   E2E_CLERK_USER_EMAIL=your-test-user@example.com
   E2E_CLERK_USER_PASSWORD=your-test-password
   ```
3. Run `npx playwright test` - auth.setup.ts will sign in and save session

### Writing New E2E Tests

- **Unauthenticated tests**: Create `{feature}.spec.ts` - tests redirects to login
- **Authenticated tests**: Create `{feature}.authenticated.spec.ts` - uses saved session
- Use fixtures from `tests/e2e/fixtures/auth.ts` for common selectors and test data

## Manual Testing Scripts

Located in project root:

- `test-debug.js` - Debug logging utilities
- `test-workout-history.js` - Test workout data retrieval

## Database Testing

Use Prisma scripts for data verification:

```bash
npx prisma studio          # Visual database UI
node scripts/summary.mjs   # Show database summary
```

## Testing Checklist for New Features

- [ ] Auth check returns 401 for unauthenticated users
- [ ] Invalid input returns 400 with error details
- [ ] Rate limiting returns 429 when exceeded
- [ ] Success case returns expected data structure
- [ ] Streaming responses include all event types
- [ ] Database records are created/updated correctly
- [ ] E2E test for unauthenticated access (redirect to login)
- [ ] E2E test for authenticated happy path

## Local Development Testing

1. Start dev server: `npm run dev`
2. Test in browser: http://localhost:3000
3. Check server logs in terminal for errors
4. Use browser DevTools Network tab for API calls
5. Use Prisma Studio to verify database state
6. Run E2E tests: `npx playwright test`
