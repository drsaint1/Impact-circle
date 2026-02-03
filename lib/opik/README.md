# Opik Integration - Impact Circle

Complete guide to Opik AI observability and advanced features implementation.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Advanced Features (4/4 Complete)](#advanced-features)
3. [Basic Integration](#basic-integration)
4. [File Structure](#file-structure)
5. [Configuration](#configuration)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)
8. [Resources](#resources)

---

## Overview

**Opik** is an open-source LLM evaluation and observability platform by Comet that provides comprehensive monitoring, tracing, and evaluation for AI applications.

### Why Opik in Impact Circle?

Impact Circle uses **6 AI agents** powered by Google Gemini. Opik provides:

1. **Real-time tracing** of all agent calls
2. **Prompt Library** for version-controlled prompts
3. **Datasets** for regression testing
4. **Experiments** for A/B testing
5. **Annotation Queues** for human-in-the-loop review
6. **Performance metrics** and cost tracking
7. **LLM-as-judge evaluations** for quality assurance

### Implementation Status

✅ **100% Complete** - All 4 Opik advanced features implemented:

- ✅ Prompt Library (6 agent prompts live)
- ✅ Datasets (skill-matcher-sample with 3 test cases)
- ✅ Experiments (4 experiments configured)
- ✅ Annotation Queues (5 queues configured)

---

## Advanced Features

### 1. 📚 Prompt Library

**Status**: ✅ Fully operational in production

**File**: `prompts.ts`

All 6 agent system prompts are version-controlled in Opik, enabling instant updates without code deployment.

**Prompts in Opik**:
- `community-intelligence-v1` - Issue discovery
- `skill-matcher-v1` - User-to-opportunity matching
- `action-coordinator-v1` - Circle planning
- `impact-measurement-v1` - Impact validation
- `engagement-coach-v1` - Burnout prevention
- `master-coordinator-v1` - Multi-agent orchestration

**Usage**:
```typescript
import { getPrompt, PROMPT_KEYS } from "@/lib/opik/prompts";

// Fetch prompt from Opik (with fallback to local)
const prompt = await getPrompt(PROMPT_KEYS.SKILL_MATCHER);

// With variable substitution
const prompt = await getPrompt(PROMPT_KEYS.SKILL_MATCHER, {
  userName: "Alex",
  location: "San Francisco"
});
```

**Creating/Updating Prompts**:
```typescript
import { createPrompt } from "@/lib/opik/prompts";

await createPrompt(
  "my-agent-v1",
  "You are a helpful assistant...",
  {
    description: "My agent prompt",
    tags: ["agent", "v1"],
    version: "1.0"
  }
);
```

**Benefits**:
- ✅ Update prompts instantly without redeploying
- ✅ A/B test different prompt variations
- ✅ Track which prompts perform best
- ✅ Version control for all AI instructions

---

### 2. 📊 Datasets

**Status**: ✅ Fully operational in production

**File**: `datasets.ts`

Production-grade test datasets for regression testing and evaluation.

**Dataset Created**: `skill-matcher-sample`
- 3 test cases:
  - Exact skill match (medium difficulty)
  - Partial skill match (easy difficulty)
  - High confidence match (easy difficulty)

**Usage**:
```typescript
import { createDataset, addDatasetItems, getDataset } from "@/lib/opik/datasets";

// Create a new dataset
await createDataset({
  name: "impact-validation-tests",
  description: "Test cases for impact measurement agent"
});

// Add test cases
await addDatasetItems("impact-validation-tests", [
  {
    input: {
      activity: "Food drive",
      claimed: { peopleHelped: 50 }
    },
    expectedOutput: {
      validated: true,
      confidence: 0.85
    },
    metadata: {
      difficulty: "medium",
      category: "realistic_claim"
    }
  }
]);

// Retrieve dataset
const dataset = await getDataset("impact-validation-tests");
```

**Benefits**:
- ✅ Regression testing ensures quality
- ✅ Golden datasets from human-reviewed examples
- ✅ Automated quality assurance
- ✅ Benchmark agent performance

---

### 3. 🧪 Experiments

**Status**: ✅ Code ready for A/B testing

**File**: `experiments.ts`

Hash-based consistent user assignment for statistically valid experiments.

**Experiments Configured**:
1. **MATCHING_MODEL** - Gemini 2.0 Flash vs 2.5 Pro
2. **MATCHING_ALGORITHM** - Skills-only vs Hybrid
3. **ENGAGEMENT_STRATEGY** - Reactive vs Proactive
4. **IMPACT_VALIDATION** - Moderate vs Strict

**Usage**:
```typescript
import { assignExperimentVariant, trackExperimentFeedback } from "@/lib/opik/experiments";

// Assign user to experiment (consistent per user)
const variant = assignExperimentVariant("matching_model", userId);
// Always returns same variant for same user

// Use appropriate model
const model = variant === "control"
  ? "gemini-2.0-flash-exp"
  : "gemini-1.5-pro";

// Track feedback
await trackExperimentFeedback("matching_model", variant, userId, {
  accepted: true,
  rating: 5
});
```

**How It Works**:
- Deterministic hashing for consistent assignment
- Same user always gets same variant
- Feedback tracked to Opik with experiment tags
- Statistical analysis in Opik dashboard

**Benefits**:
- ✅ Data-driven optimization
- ✅ Compare model performance
- ✅ Test strategies scientifically
- ✅ Track statistical significance

---

### 4. 📝 Annotation Queues

**Status**: ✅ Code ready for human review

**File**: `annotations.ts`

Automatic queuing of low-confidence predictions for human review.

**Queues Configured**:
1. **skill_matching_review** - Low-confidence matches
2. **impact_validation_review** - Impact verification
3. **safety_review** - Safety flag triggers
4. **low_confidence_review** - Generic low-confidence
5. **user_feedback_review** - User-reported issues

**Usage**:
```typescript
import { queueForReview, autoQueueForReview, ANNOTATION_QUEUES } from "@/lib/opik/annotations";

// Manual queue
await queueForReview(ANNOTATION_QUEUES.SKILL_MATCHING, {
  agentName: "skill_matcher",
  input: userProfile,
  output: recommendations,
  priority: "high"
});

// Auto-queue based on confidence
await autoQueueForReview(
  "skill_matcher",
  input,
  output,
  0.65  // If confidence < 0.7, auto-queues
);
```

**Auto-Queue Rules**:
- Confidence < 0.7 → LOW_CONFIDENCE queue (HIGH priority)
- Safety flags → SAFETY_REVIEW queue (HIGH priority)
- Rejected validations → IMPACT_VALIDATION queue

**Benefits**:
- ✅ Quality control for edge cases
- ✅ Build training datasets
- ✅ Identify agent weaknesses
- ✅ Human oversight for critical decisions

---

## Basic Integration

### Tracing Strategy

**Two-level tracing approach**:

1. **Agent-Level Tracing** (Primary)
   - Wraps entire agent calls using `traceAgentCall()`
   - Captures full lifecycle (input → processing → output)
   - Used by all 6 AI agents

2. **Model-Level Tracing** (Supplementary)
   - Traces streaming LLM calls via `TrackedGenerativeModel`
   - Captures tokens, costs, latency
   - Only for streaming operations

### Key Design Decisions

**Authenticated Fetch Wrapper**
- Fixes 401 errors in Next.js serverless
- Intercepts Opik API calls only
- Injects auth headers automatically

**Singleton Pattern**
- Single Opik client instance
- Prevents multiple initializations
- Manages environment variables

**Manual Tracing**
- Uses `@google/generative-ai` (official Google SDK)
- Manual tracing via `TrackedGenerativeModel` class
- More control than `opik-gemini` package

---

## File Structure

```
lib/opik/
├── README.md              # This file
├── index.ts              # Main exports
├── config.ts             # Client singleton + auth wrapper
├── client.ts             # Core tracing functions
├── server.ts             # Server initialization
├── gemini-wrapper.ts     # Tracked Gemini model
├── prompts.ts            # ✅ Prompt Library
├── datasets.ts           # ✅ Datasets
├── experiments.ts        # ✅ Experiments
├── annotations.ts        # ✅ Annotation Queues
├── evaluations.ts        # Evaluation pipeline
├── metrics/              # Custom metrics
└── feedback.ts           # User feedback
```

---

## Configuration

### Environment Variables

```bash
# Required
OPIK_API_KEY=your_api_key_here
OPIK_WORKSPACE=your_workspace_name

# Optional
OPIK_PROJECT_NAME=Impact Circle
OPIK_URL_OVERRIDE=https://www.comet.com/opik/api
```

**Getting Credentials**:
1. Sign up at [comet.com/opik](https://www.comet.com/opik)
2. Settings → API Keys → Create new key
3. Copy workspace name from URL

### Model Cost Configuration

Model pricing in `config.ts`:

```typescript
export const MODEL_COSTS = {
  "gemini-2.0-flash-exp": {
    inputCostPer1M: 0.0,    // Free during experimental
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

---

## Usage Examples

### 1. Tracing AI Agent Calls

```typescript
import { traceAgentCall } from "@/lib/opik";

export async function matchUserWithOpportunities(userId: string) {
  return await traceAgentCall(
    "skill_matcher",
    { userId },
    async () => {
      const user = await getUser(userId);
      const matches = await findMatches(user);
      return matches;
    },
    { source: "api", version: "v1" }
  );
}
```

### 2. Using Tracked Gemini Models

```typescript
import { createTrackedModel } from "@/lib/opik";

const model = createTrackedModel("gemini-2.0-flash-exp", {
  agent: "skill_matcher",
  userId: "123"
});

// Streaming with auto-tracing
const stream = model.generateContentStream("Find opportunities", {
  operation: "find_opportunities",
  tags: ["matching"],
  metadata: { location: "SF" }
});

for await (const chunk of stream) {
  console.log(chunk.text());
}
```

### 3. Evaluating Agent Responses

```typescript
import { evaluateAgentResponse } from "@/lib/opik";

const evaluation = await evaluateAgentResponse(
  "skill_matcher",
  { userId: "123", skills: ["coding"] },
  { matches: [...], confidence: 0.85 },
  "gemini-2.0-flash-exp"
);

console.log(evaluation.scores);
// { safety: 95, personalization: 88, actionability: 92, ... }
```

### 4. Server Route Initialization

```typescript
import { initOpikServer } from "@/lib/opik";

export async function POST(request: Request) {
  initOpikServer(); // Logs Opik configuration status

  // Your API logic with traceAgentCall()
}
```

---

## Quick Start

### Initialize All Features

```bash
# One-command setup
npx tsx scripts/setup-opik-features.ts
```

This script:
- ✅ Uploads all 6 agent prompts
- ✅ Creates skill-matcher-sample dataset
- ✅ Displays configured experiments
- ✅ Displays configured annotation queues

### Test All Features

```bash
npx tsx scripts/test-opik-features.ts
```

Tests:
- Experiment variant assignment (consistency check)
- Annotation queue functionality
- Prompt Library retrieval

### View in Dashboard

1. Go to [comet.com](https://www.comet.com)
2. Navigate to Opik section
3. View tabs:
   - **Prompt Library** - 6 prompts
   - **Datasets** - skill-matcher-sample
   - **Traces** - Real-time agent calls
   - **Experiments** - A/B test results
   - **Annotations** - Queued items for review

---

## Troubleshooting

### 401 Authentication Errors

**Solution**: Already fixed by authenticated fetch wrapper.

If still occurring:
1. Verify `OPIK_API_KEY` is set
2. Check API key validity in Comet dashboard
3. Ensure using `getOpikClient()`

### Traces Not Appearing

**Solutions**:
1. Check environment variables
2. Verify `traceAgentCall()` is used
3. Ensure `trace.end()` is called
4. Check `opikClient.flush()`
5. Review server logs for errors

### Datasets Failing

**Error**: `Dataset already exists`

**Solution**: This is success! Dataset was created previously.

To recreate:
```typescript
import { deleteDataset } from "@/lib/opik/datasets";
await deleteDataset("skill-matcher-sample");
```

### TypeScript Errors

**Old functions removed**:
- ❌ `traceLLMCall()` → ✅ `traceAgentCall()`
- ❌ `flushOpik()` → ✅ `flushTraces()`

### High Costs

**Solutions**:
1. Check Opik dashboard for token usage
2. Use `model.countTokens()` to estimate
3. Switch to `gemini-2.0-flash-exp` (free)
4. Optimize prompts
5. Review `calculateModelCost()` pricing

---

## Advanced Topics

### Custom Tags and Metadata

```typescript
import { TRACE_TAGS, getEnvironmentTag } from "@/lib/opik/config";

await traceAgentCall(
  "skill_matcher",
  input,
  agentFn,
  {
    environment: getEnvironmentTag(),
    experimentId: "v2_algorithm",
    userId: "123"
  }
);
```

### Graceful Shutdown

```typescript
import { shutdownOpik } from "@/lib/opik/config";

process.on("SIGTERM", async () => {
  await shutdownOpik();
  process.exit(0);
});
```

### Cost Tracking

```typescript
import { calculateModelCost } from "@/lib/opik/config";

const cost = calculateModelCost(
  "gemini-1.5-pro",
  inputTokens,
  outputTokens
);

console.log(`Cost: $${cost.toFixed(4)}`);
```

---

## Resources

### Documentation
- [Opik Docs](https://www.comet.com/docs/opik)
- [Opik TypeScript SDK](https://www.comet.com/docs/opik/integrations/typescript-sdk)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Impact Circle Docs](../../DOCUMENTATION.md)

### Related Files
- [AI Agents](../ai/agents/) - All 6 agents
- [Setup Script](../../scripts/setup-opik-features.ts)
- [Test Script](../../scripts/test-opik-features.ts)

---

## Contributing

When adding new AI agents:

1. ✅ Wrap main logic with `traceAgentCall()`
2. ✅ Use descriptive agent names (lowercase, underscores)
3. ✅ Include relevant metadata (userId, source, version)
4. ✅ Test traces appear in Opik dashboard
5. ✅ Document new tracing patterns here

---

## Production Checklist

Before deploying:

- [ ] Set `OPIK_API_KEY` in production
- [ ] Enable tracing for all agent calls
- [ ] Configure monitoring alerts
- [ ] Set up annotation queues
- [ ] Run baseline evaluations
- [ ] Enable A/B testing
- [ ] Configure retention policies

---

**Built with ❤️ using Opik for production-grade AI observability**

For complete project documentation, see [DOCUMENTATION.md](../../DOCUMENTATION.md)
