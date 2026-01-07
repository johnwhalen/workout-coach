---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
---

# Testing Standards

## Test Structure

- Place tests adjacent to source files or in `__tests__` directories
- Name test files as `{component}.test.tsx` or `{module}.test.ts`
- Group related tests with `describe` blocks
- Use clear, descriptive test names

## Testing Priorities

1. **API Routes**: Test auth, validation, response formats
2. **AI Processing**: Test parsing, intent detection, data extraction
3. **Database Operations**: Test CRUD operations, relationships
4. **UI Components**: Test user interactions, state changes

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

## Local Development Testing

1. Start dev server: `npm run dev`
2. Test in browser: http://localhost:3000
3. Check server logs in terminal for errors
4. Use browser DevTools Network tab for API calls
5. Use Prisma Studio to verify database state
