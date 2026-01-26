# Opik Integration Documentation

Comprehensive LLM observability and tracing for Impact Circle's AI agents using [Comet Opik](https://www.comet.com/opik).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

**What is Opik?**

Opik is an open-source LLM evaluation and observability platform by Comet. It provides:
- Real-time tracing of AI agent calls
- Token usage and cost tracking
- Performance metrics and latency measurements
- Error tracking and debugging
- Experiment tracking and A/B testing capabilities

**Why use Opik in Impact Circle?**

Impact Circle uses 6 AI agents powered by Google Gemini to match volunteers with opportunities. Opik helps us:
1. Monitor agent performance in production
2. Debug issues by tracing exact inputs/outputs
3. Track costs across different Gemini models
4. Evaluate response quality using LLM-as-judge
5. Optimize prompts based on real usage data

## Architecture

### Tracing Strategy

The Opik integration uses a **two-level tracing approach**:

1. **Agent-Level Tracing** (Primary)
   - Wraps entire agent calls using `traceAgentCall()`
   - Captures full agent lifecycle (input → processing → output)
   - Used by all 6 AI agents in the project
   - Handles both success and error cases

2. **Model-Level Tracing** (Supplementary)
   - Traces streaming LLM calls via `TrackedGenerativeModel`
   - Captures token usage, costs, and latency
   - Only for streaming and token counting operations
   - Non-streaming calls skip model-level tracing to avoid SDK batch queue issues

### Key Design Decisions

**Authenticated Fetch Wrapper**
- Fixes 401 errors in Next.js serverless environments
- Intercepts Opik API calls only (not CSS, images, etc.)
- Injects authentication headers automatically
- Re-applied on every serverless function invocation

**Singleton Pattern**
- Single Opik client instance across the application
- Prevents multiple initializations
- Manages environment variables for serverless contexts

**Manual Tracing (Not opik-gemini)**
- This project uses `@google/generative-ai` (official Google SDK)
- The `opik-gemini` package requires `@google/genai` (different SDK)
- We implement manual tracing via `TrackedGenerativeModel` class
- Provides same functionality with more control

## File Structure

```
lib/opik/
├── README.md              # This file
├── index.ts              # Main export file
├── config.ts             # Singleton client + authenticated fetch wrapper
├── client.ts             # Core tracing functions (traceAgentCall, evaluateAgentResponse)
├── server.ts             # Server initialization for API routes
└── gemini-wrapper.ts     # Tracked Gemini model with automatic tracing
```

### File Details

| File | Purpose | Used By |
|------|---------|---------|
| **config.ts** | Opik client singleton with authenticated fetch wrapper | All Opik modules |
| **client.ts** | Agent tracing and evaluation functions | All 6 AI agents |
| **server.ts** | Logs Opik configuration status in API routes | API route handlers |
| **gemini-wrapper.ts** | Tracked Gemini model for streaming and token counting | Gemini config |
| **index.ts** | Exports all Opik functionality | External imports |

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Opik Configuration
OPIK_API_KEY=your_api_key_here
OPIK_WORKSPACE_NAME=your_workspace_name
OPIK_PROJECT_NAME=impact-circle
OPIK_URL_OVERRIDE=https://www.comet.com/opik/api  # Optional
```

**Getting Opik Credentials:**

1. Sign up at [https://www.comet.com/opik](https://www.comet.com/opik)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy your workspace name from the URL (e.g., `enricha-intl`)

### Model Cost Configuration

Model pricing is defined in `config.ts`:

```typescript
export const MODEL_COSTS = {
  "gemini-2.0-flash-exp": {
    inputCostPer1M: 0.0,    // Free during experimental phase
    outputCostPer1M: 0.0,
  },
  "gemini-1.5-pro": {
    inputCostPer1M: 3.5,
    outputCostPer1M: 10.5,
  },
  "gemini-1.5-flash": {
    inputCostPer1M: 0.35,
    outputCostPer1M: 1.05,
  },
};
```

Update these prices when Google changes their pricing.

## Usage

### 1. Tracing AI Agent Calls

**All AI agents should use `traceAgentCall()` to wrap their main logic:**

```typescript
// lib/ai/agents/skill-matcher.ts
import { traceAgentCall } from "@/lib/opik";

export async function matchUserWithOpportunities(userId: string) {
  return await traceAgentCall(
    "skill_matcher",                    // Agent name
    { userId },                         // Input data
    async () => {
      // Your agent logic here
      const user = await getUser(userId);
      const matches = await findMatches(user);
      return matches;
    },
    { source: "api", version: "v1" }   // Optional metadata
  );
}
```

**What gets traced:**
- Agent name and input data
- Execution duration (ms)
- Success/error status
- Output data or error message
- Custom metadata and tags

### 2. Using Tracked Gemini Models

**For streaming LLM calls with automatic tracing:**

```typescript
import { createTrackedModel } from "@/lib/opik";

const model = createTrackedModel("gemini-2.0-flash-exp", {
  agent: "skill_matcher",
  userId: "123"
});

// Streaming with automatic tracing
const stream = model.generateContentStream("Find volunteer opportunities", {
  operation: "find_opportunities",
  tags: ["matching", "volunteers"],
  metadata: { location: "San Francisco" }
});

for await (const chunk of stream) {
  console.log(chunk.text());
}
```

**For non-streaming calls (uses agent-level tracing):**

```typescript
const model = createTrackedModel("gemini-2.0-flash-exp");
const response = await model.generateContent("Hello");
// No model-level trace created (avoids SDK batch queue issues)
// Wrap with traceAgentCall() for agent-level tracing
```

### 3. Evaluating Agent Responses

**Use LLM-as-judge to evaluate response quality:**

```typescript
import { evaluateAgentResponse } from "@/lib/opik";

const evaluation = await evaluateAgentResponse(
  "skill_matcher",
  { userId: "123", skills: ["coding"] },
  { matches: [...], confidence: 0.85 },
  "gemini-2.0-flash-exp"
);

console.log(evaluation.scores);
// {
//   safety: 95,
//   personalization: 88,
//   actionability: 92,
//   evidenceBased: 90,
//   overall: 91
// }
```

### 4. Server Route Initialization

**Add to API routes that use Opik tracing:**

```typescript
// app/api/matching/recommend/route.ts
import { initOpikServer } from "@/lib/opik";

export async function POST(request: Request) {
  initOpikServer(); // Logs "✅ Opik configured for this route"

  // Your API logic with traceAgentCall()
}
```

## Examples

### Example 1: Complete Agent Integration

```typescript
// lib/ai/agents/engagement-coach.ts
import { traceAgentCall } from "@/lib/opik";
import { getModel } from "@/lib/gemini/config";

export async function generateEngagementAdvice(userId: string) {
  return await traceAgentCall(
    "engagement_coach",
    { userId },
    async () => {
      // Get user context
      const user = await getUserProfile(userId);
      const history = await getEngagementHistory(userId);

      // Generate advice using Gemini
      const model = getModel("FLASH", false);
      const prompt = `Generate engagement advice for: ${JSON.stringify(user)}`;
      const result = await model.generateContent(prompt);

      return {
        advice: result.response.text(),
        confidence: 0.85,
        timestamp: new Date().toISOString()
      };
    },
    {
      source: "engagement_api",
      userType: user.type
    }
  );
}
```

### Example 2: Streaming with Full Tracing

```typescript
import { createTrackedModel } from "@/lib/opik";

export async function* generateImpactReport(projectId: string) {
  const model = createTrackedModel("gemini-1.5-pro", {
    agent: "impact_measurement",
    projectId
  });

  const prompt = `Generate impact report for project ${projectId}`;

  // Automatically traces: tokens, cost, latency, chunks
  const stream = model.generateContentStream(prompt, {
    operation: "generate_impact_report",
    tags: ["reporting", "impact"],
    metadata: { format: "markdown" }
  });

  for await (const chunk of stream) {
    yield chunk.text();
  }
}
```

### Example 3: Token Counting Before Generation

```typescript
import { createTrackedModel } from "@/lib/opik";

const model = createTrackedModel("gemini-2.0-flash-exp");

// Count tokens to estimate cost
const longPrompt = "...very long prompt...";
const tokenCount = await model.countTokens(longPrompt, {
  operation: "estimate_prompt_cost",
  metadata: { userId: "123" }
});

console.log(`Estimated cost: $${(tokenCount / 1_000_000) * 0.35}`);

// Proceed with generation if under budget
if (tokenCount < 10000) {
  const result = await model.generateContent(longPrompt);
}
```

## Troubleshooting

### Issue: 401 Authentication Errors

**Symptoms:**
```
Error: 401 Unauthorized - Batch queue error
```

**Solution:**
This is already fixed by the authenticated fetch wrapper in `config.ts`. If you still see this:
1. Verify `OPIK_API_KEY` and `OPIK_WORKSPACE_NAME` are set
2. Check the API key is valid in Comet dashboard
3. Ensure you're calling `getOpikClient()` which applies the fetch wrapper

### Issue: Traces Not Appearing in Dashboard

**Symptoms:**
Agent runs successfully but no traces in Opik dashboard.

**Solution:**
1. Check environment variables are set correctly
2. Verify you're using `traceAgentCall()` wrapper
3. Ensure `trace.end()` is called (automatic in `traceAgentCall`)
4. Check if `opikClient.flush()` is being called
5. Look for errors in server logs

### Issue: TypeScript Errors After Cleanup

**Symptoms:**
```
Module '"@/lib/opik"' has no exported member 'traceLLMCall'
```

**Solution:**
These functions were removed during cleanup. Use instead:
- ❌ `traceLLMCall()` → ✅ `traceAgentCall()`
- ❌ `flushOpik()` → ✅ `flushTraces()` from config
- ❌ `logExperiment()` → ✅ Use `traceAgentCall()` with metadata

### Issue: High Costs

**Symptoms:**
Unexpectedly high Gemini API costs.

**Solution:**
1. Check Opik dashboard for token usage by agent
2. Use `model.countTokens()` to estimate costs before generation
3. Switch from `gemini-1.5-pro` to `gemini-2.0-flash-exp` (free)
4. Optimize prompts to reduce token usage
5. Review `calculateModelCost()` in config.ts for pricing

### Issue: Serverless Environment Issues

**Symptoms:**
Opik works locally but fails in production (Vercel/Netlify).

**Solution:**
The authenticated fetch wrapper handles this. Verify:
1. Environment variables are set in production
2. `getOpikClient()` is called on every serverless function invocation
3. Check serverless function logs for Opik initialization messages

## Advanced Topics

### Custom Tags and Metadata

Organize traces with custom tags:

```typescript
import { TRACE_TAGS, getEnvironmentTag } from "@/lib/opik/config";

await traceAgentCall(
  "skill_matcher",
  input,
  agentFn,
  {
    environment: getEnvironmentTag(),
    customTag: "high_priority",
    userId: "123",
    experimentId: "v2_algorithm"
  }
);
```

### Graceful Shutdown

Flush pending traces before shutdown:

```typescript
import { shutdownOpik } from "@/lib/opik/config";

process.on("SIGTERM", async () => {
  await shutdownOpik();
  process.exit(0);
});
```

### Cost Tracking

Track costs by agent:

```typescript
import { calculateModelCost } from "@/lib/opik/config";

const cost = calculateModelCost(
  "gemini-1.5-pro",
  inputTokens,
  outputTokens
);

console.log(`This call cost: $${cost.toFixed(4)}`);
```

## Resources

- [Opik Documentation](https://www.comet.com/docs/opik)
- [Opik TypeScript SDK](https://www.comet.com/docs/opik/integrations/typescript-sdk)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Impact Circle AI Agents](../ai/agents/)

## Contributing

When adding new AI agents:

1. ✅ Wrap main logic with `traceAgentCall()`
2. ✅ Use descriptive agent names (lowercase, underscores)
3. ✅ Include relevant metadata (userId, source, version)
4. ✅ Test that traces appear in Opik dashboard
5. ✅ Document any new tracing patterns here

## License

This Opik integration is part of Impact Circle and follows the same license.
