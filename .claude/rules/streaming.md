---
paths:
  - app/api/**/*.ts
  - app/chat/**/*.tsx
---

# SSE Streaming Patterns

## Server-Side (API Routes)

### Stream Setup

```typescript
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const encoder = new TextEncoder();

const stream = new ReadableStream({
  async start(controller) {
    // Stream logic here
    controller.close();
  },
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
```

### Event Format

Always use double newline `\n\n` as separator:

```typescript
controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
```

### Event Types

```typescript
// Start event
{ type: "start", message: "Processing..." }

// Progress event (optional)
{ type: "progress", message: "Step 1 of 3...", progress: 33 }

// Complete event
{ type: "complete", message: "Done!", isComplete: true }

// Error event
{ type: "error", message: "Something went wrong" }
```

## Client-Side (React)

### Fetch with SSE

```typescript
const response = await fetch("/api/endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n\n");
  buffer = lines.pop() || "";

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      // Handle event based on data.type
    }
  }
}
```

### Buffer Handling

- Use `\n\n` as event delimiter (SSE standard)
- Keep incomplete data in buffer for next iteration
- Handle `stream: true` option in TextDecoder

## Error Handling

- Always wrap stream logic in try/catch
- Send error event before closing on failure
- Log errors server-side for debugging
- Close controller in finally block
