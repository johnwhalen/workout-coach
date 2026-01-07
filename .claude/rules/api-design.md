---
paths: app/api/**/*.ts
---

# API Route Standards

## Authentication

- Use `currentUser()` from `@clerk/nextjs/server` for auth checks
- Return 401 with `{ error: "Unauthorized" }` for unauthenticated requests
- Always check auth outside streaming contexts

## Request Validation

- Use Zod schemas for request body validation
- Return 400 with `{ error: "Invalid request", details: [...] }` for validation failures
- Limit prompt/text fields to reasonable lengths (e.g., 10000 chars)

## Rate Limiting

- Use `checkRateLimit()` from `@/lib/rate-limit`
- Return 429 with rate limit headers when exceeded
- Include `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers

## Response Format

- JSON responses: `{ error: string }` for errors, domain-specific for success
- SSE streams: Use `data: ${JSON.stringify(payload)}\n\n` format
- Always include appropriate `Content-Type` header

## Streaming Responses

- Use `ReadableStream` with `TextEncoder` for SSE
- Set headers: `text/event-stream`, `no-cache`, `keep-alive`
- Use `force-dynamic` export for streaming routes
- Set `maxDuration` for long-running requests (default 30s)

## Error Handling

- Wrap stream logic in try/catch
- Send error events to client before closing stream
- Log errors with `console.error()` for debugging

## Example Structure

```typescript
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
    const user = await currentUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) return new Response(..., { status: 429 });

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return new Response(..., { status: 400 });

    // Process request...
}
```
