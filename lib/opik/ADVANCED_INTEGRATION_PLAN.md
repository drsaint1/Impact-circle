# Sophisticated Opik Integration Plan for Impact Circle

**Comprehensive roadmap for advanced LLM observability, evaluation, and optimization**

---

## Executive Summary

This document outlines a **sophisticated, production-grade Opik integration** across the Impact Circle platform. We'll implement ALL available Opik features to create a best-in-class AI observability system for your 6 AI agents.

### Current Status ✅
- ✅ Basic tracing with `traceAgentCall()`
- ✅ Authenticated fetch wrapper for serverless
- ✅ Token usage and cost tracking
- ✅ Gemini model wrapper with streaming support

### Planned Advanced Features 🚀
- 📊 **Datasets** - Curated evaluation datasets for each agent
- 🧪 **Experiments** - A/B testing for prompts and models
- 📝 **Annotations & Feedback** - Human-in-the-loop evaluation
- ⚡ **Online Evaluations** - Real-time LLM-as-judge scoring
- 📋 **Prompt Management** - Versioned, collaborative prompt library
- 📈 **Advanced Metrics** - Hallucination detection, RAG metrics, custom evaluators
- 🔗 **Spans & Nested Traces** - Granular operation tracking
- 📊 **Production Dashboard** - Real-time monitoring and alerting
- 💰 **Budget Tracking** - Cost limits and alerts per agent
- 🤖 **Agent Workflows** - Multi-agent orchestration tracing

---

## Part 1: Datasets & Evaluation

### 1.1 Dataset Management

**Purpose**: Create curated test datasets for systematic agent evaluation.

**Use Cases for Impact Circle**:
- **Skill Matcher**: 100+ volunteer profiles with known good/bad opportunity matches
- **Community Intelligence**: Community questions with expert-validated answers
- **Engagement Coach**: User scenarios with expected engagement strategies
- **Impact Measurement**: Projects with verified impact metrics
- **Action Coordinator**: Multi-step workflows with optimal action sequences
- **Master Coordinator**: Complex routing decisions with correct agent assignments

**Implementation Strategy**:

```typescript
// lib/opik/datasets.ts

import { getOpikClient } from "./config";

/**
 * Dataset item structure for Impact Circle agents
 */
export interface DatasetItem {
  input: {
    userId?: string;
    context?: Record<string, any>;
    query?: string;
    [key: string]: any;
  };
  expectedOutput?: {
    confidence?: number;
    matches?: any[];
    recommendations?: string[];
    [key: string]: any;
  };
  metadata?: {
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
    source?: string;
    validatedBy?: string;
    validatedAt?: string;
  };
}

/**
 * Create a new dataset for an agent
 */
export async function createDataset(
  name: string,
  description: string
): Promise<string> {
  const opikClient = getOpikClient();
  if (!opikClient) throw new Error("Opik not configured");

  const dataset = await opikClient.createDataset({
    name,
    description,
  });

  console.log(`✅ Created dataset: ${name} (ID: ${dataset.id})`);
  return dataset.id;
}

/**
 * Add items to a dataset
 */
export async function addDatasetItems(
  datasetName: string,
  items: DatasetItem[]
): Promise<void> {
  const opikClient = getOpikClient();
  if (!opikClient) throw new Error("Opik not configured");

  await opikClient.insertDatasetItems({
    datasetName,
    items: items.map((item) => ({
      input: item.input,
      expectedOutput: item.expectedOutput,
      metadata: item.metadata,
    })),
  });

  console.log(`✅ Added ${items.length} items to dataset: ${datasetName}`);
}

/**
 * Get dataset for evaluation
 */
export async function getDataset(name: string) {
  const opikClient = getOpikClient();
  if (!opikClient) throw new Error("Opik not configured");

  return await opikClient.getDataset({ name });
}
```

**Example Usage**:

```typescript
// scripts/seed-datasets.ts

import { createDataset, addDatasetItems } from "@/lib/opik/datasets";

async function seedSkillMatcherDataset() {
  const datasetId = await createDataset(
    "skill-matcher-evaluation",
    "Curated test cases for skill matching agent"
  );

  await addDatasetItems("skill-matcher-evaluation", [
    {
      input: {
        userId: "test-123",
        skills: ["JavaScript", "React", "TypeScript"],
        interests: ["education", "youth mentoring"],
        location: "San Francisco",
        availability: ["weekends"],
      },
      expectedOutput: {
        confidence: 0.85,
        matches: [
          {
            opportunityId: "opp-456",
            matchScore: 0.9,
            reasons: ["Skills match", "Location match", "Interest alignment"],
          },
        ],
      },
      metadata: {
        difficulty: "medium",
        category: "exact_skill_match",
        source: "production_data",
        validatedBy: "expert@impact-circle.org",
        validatedAt: new Date().toISOString(),
      },
    },
    // ... 99 more test cases
  ]);
}
```

### 1.2 Automated Evaluations

**Purpose**: Run systematic evaluations against datasets to measure agent performance.

```typescript
// lib/opik/evaluations.ts

import { getOpikClient } from "./config";
import type { DatasetItem } from "./datasets";

/**
 * Evaluation metric function signature
 */
export type EvaluationMetric<T = any> = (params: {
  input: any;
  output: any;
  expectedOutput?: any;
  context?: any;
}) => Promise<{
  name: string;
  value: number;
  reason?: string;
}>;

/**
 * Relevance metric: How relevant is the agent's output?
 */
export const relevanceMetric: EvaluationMetric = async ({
  input,
  output,
}) => {
  const opikClient = getOpikClient();
  if (!opikClient) {
    return { name: "relevance", value: 0.5, reason: "Opik not configured" };
  }

  // Use Gemini as judge
  const { getModel } = await import("@/lib/gemini/config");
  const model = getModel("EVAL", false);

  const prompt = `Evaluate the relevance of this AI agent response.

Input: ${JSON.stringify(input, null, 2)}
Output: ${JSON.stringify(output, null, 2)}

Score the relevance from 0-100. Respond with JSON:
{
  "score": <number>,
  "reason": "<explanation>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    name: "relevance",
    value: parsed.score / 100,
    reason: parsed.reason,
  };
};

/**
 * Accuracy metric: Does output match expected output?
 */
export const accuracyMetric: EvaluationMetric = async ({
  output,
  expectedOutput,
}) => {
  if (!expectedOutput) {
    return { name: "accuracy", value: 0, reason: "No expected output provided" };
  }

  // Simple JSON similarity comparison
  const outputStr = JSON.stringify(output);
  const expectedStr = JSON.stringify(expectedOutput);

  // Basic string similarity (can be enhanced with more sophisticated algorithms)
  const similarity = stringSimilarity(outputStr, expectedStr);

  return {
    name: "accuracy",
    value: similarity,
    reason: `Output similarity: ${(similarity * 100).toFixed(1)}%`,
  };
};

/**
 * Hallucination metric: Does the output contain false information?
 */
export const hallucinationMetric: EvaluationMetric = async ({
  input,
  output,
  context,
}) => {
  const { getModel } = await import("@/lib/gemini/config");
  const model = getModel("EVAL", false);

  const prompt = `Detect hallucinations in this AI response.

Context/Input: ${JSON.stringify({ input, context }, null, 2)}
AI Output: ${JSON.stringify(output, null, 2)}

Score hallucination from 0-100 (0 = factual, 100 = fully hallucinated).
Respond with JSON:
{
  "score": <number>,
  "reason": "<explanation>",
  "examples": ["<example 1>", "<example 2>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    name: "hallucination",
    value: 1 - parsed.score / 100, // Invert: higher is better
    reason: parsed.reason,
  };
};

/**
 * Run evaluation on a dataset
 */
export async function evaluateAgent(config: {
  agentName: string;
  agentFunction: (input: any) => Promise<any>;
  datasetName: string;
  metrics: EvaluationMetric[];
  experimentName?: string;
}): Promise<{
  averageScores: Record<string, number>;
  results: any[];
}> {
  const opikClient = getOpikClient();
  if (!opikClient) throw new Error("Opik not configured");

  const dataset = await opikClient.getDataset({ name: config.datasetName });
  const results: any[] = [];
  const scores: Record<string, number[]> = {};

  console.log(
    `🧪 Evaluating ${config.agentName} on ${dataset.items.length} test cases...`
  );

  for (const item of dataset.items) {
    try {
      // Run agent on test case
      const output = await config.agentFunction(item.input);

      // Calculate metrics
      const metricResults = await Promise.all(
        config.metrics.map((metric) =>
          metric({
            input: item.input,
            output,
            expectedOutput: item.expectedOutput,
            context: item.metadata,
          })
        )
      );

      // Aggregate scores
      for (const metric of metricResults) {
        if (!scores[metric.name]) scores[metric.name] = [];
        scores[metric.name].push(metric.value);
      }

      results.push({
        input: item.input,
        output,
        expectedOutput: item.expectedOutput,
        metrics: metricResults,
        metadata: item.metadata,
      });
    } catch (error) {
      console.error(`Error evaluating item:`, error);
      results.push({
        input: item.input,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Calculate averages
  const averageScores: Record<string, number> = {};
  for (const [name, values] of Object.entries(scores)) {
    averageScores[name] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  console.log(`✅ Evaluation complete. Average scores:`, averageScores);

  return { averageScores, results };
}

// Helper function
function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function editDistance(s1: string, s2: string): number {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
```

---

## Part 2: Experiments & A/B Testing

### 2.1 Experiment Tracking

**Purpose**: Compare different prompts, models, or parameters systematically.

```typescript
// lib/opik/experiments.ts

import { getOpikClient } from "./config";
import { evaluateAgent, type EvaluationMetric } from "./evaluations";

export interface ExperimentConfig {
  name: string;
  description: string;
  datasetName: string;
  variants: {
    name: string;
    agentFunction: (input: any) => Promise<any>;
    config?: Record<string, any>;
  }[];
  metrics: EvaluationMetric[];
}

/**
 * Run an A/B experiment comparing multiple agent variants
 */
export async function runExperiment(config: ExperimentConfig): Promise<{
  winner: string;
  results: Record<
    string,
    { averageScores: Record<string, number>; results: any[] }
  >;
}> {
  console.log(`🧪 Running experiment: ${config.name}`);
  console.log(`   Variants: ${config.variants.map((v) => v.name).join(", ")}`);

  const results: Record<
    string,
    { averageScores: Record<string, number>; results: any[] }
  > = {};

  // Run each variant
  for (const variant of config.variants) {
    console.log(`\n📊 Testing variant: ${variant.name}`);

    const evalResults = await evaluateAgent({
      agentName: variant.name,
      agentFunction: variant.agentFunction,
      datasetName: config.datasetName,
      metrics: config.metrics,
      experimentName: config.name,
    });

    results[variant.name] = evalResults;

    console.log(
      `   Results: ${JSON.stringify(evalResults.averageScores, null, 2)}`
    );
  }

  // Determine winner (highest average across all metrics)
  let winner = config.variants[0].name;
  let highestScore = 0;

  for (const [variantName, result] of Object.entries(results)) {
    const avgScore =
      Object.values(result.averageScores).reduce((a, b) => a + b, 0) /
      Object.values(result.averageScores).length;

    if (avgScore > highestScore) {
      highestScore = avgScore;
      winner = variantName;
    }
  }

  console.log(`\n🏆 Winner: ${winner} (score: ${highestScore.toFixed(3)})`);

  return { winner, results };
}
```

**Example Usage**:

```typescript
// scripts/run-prompt-experiment.ts

import { runExperiment } from "@/lib/opik/experiments";
import { relevanceMetric, accuracyMetric } from "@/lib/opik/evaluations";
import { matchUserWithOpportunities } from "@/lib/ai/agents/skill-matcher";

async function testPromptVariants() {
  const results = await runExperiment({
    name: "skill-matcher-prompt-v2",
    description: "Testing new prompt template for skill matching",
    datasetName: "skill-matcher-evaluation",
    variants: [
      {
        name: "current_prompt",
        agentFunction: async (input) => {
          // Use current prompt
          return await matchUserWithOpportunities(input.userId);
        },
        config: { promptVersion: "v1" },
      },
      {
        name: "detailed_prompt",
        agentFunction: async (input) => {
          // Override with new detailed prompt
          // Implementation details...
          return await matchUserWithOpportunities(input.userId);
        },
        config: { promptVersion: "v2-detailed" },
      },
      {
        name: "concise_prompt",
        agentFunction: async (input) => {
          // Override with concise prompt
          return await matchUserWithOpportunities(input.userId);
        },
        config: { promptVersion: "v2-concise" },
      },
    ],
    metrics: [relevanceMetric, accuracyMetric],
  });

  // Log results to Opik dashboard
  console.log("Experiment complete:", results);
}
```

---

## Part 3: Annotations & Feedback

### 3.1 User Feedback Collection

**Purpose**: Collect real user feedback on agent responses for continuous improvement.

```typescript
// lib/opik/feedback.ts

import { getOpikClient } from "./config";

export interface FeedbackScore {
  name: string;
  value: number; // 0-1 scale
  reason?: string;
  category?: "quality" | "relevance" | "helpfulness" | "accuracy" | "custom";
}

/**
 * Log feedback score to a trace
 */
export async function logFeedback(params: {
  traceId: string;
  scores: FeedbackScore[];
  comment?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const opikClient = getOpikClient();
  if (!opikClient) {
    console.warn("Opik not configured, skipping feedback logging");
    return;
  }

  try {
    for (const score of params.scores) {
      await opikClient.logFeedbackScore({
        traceId: params.traceId,
        name: score.name,
        value: score.value,
        reason: score.reason,
        categoryName: score.category || "custom",
      });
    }

    console.log(`✅ Logged ${params.scores.length} feedback scores`);
  } catch (error) {
    console.error("Failed to log feedback:", error);
  }
}

/**
 * Thumbs up/down feedback
 */
export async function logThumbsFeedback(params: {
  traceId: string;
  thumbsUp: boolean;
  comment?: string;
  userId?: string;
}): Promise<void> {
  await logFeedback({
    traceId: params.traceId,
    scores: [
      {
        name: "user_satisfaction",
        value: params.thumbsUp ? 1.0 : 0.0,
        reason: params.comment,
        category: "quality",
      },
    ],
    userId: params.userId,
  });
}

/**
 * 5-star rating feedback
 */
export async function logStarRating(params: {
  traceId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  userId?: string;
}): Promise<void> {
  await logFeedback({
    traceId: params.traceId,
    scores: [
      {
        name: "star_rating",
        value: (params.stars - 1) / 4, // Normalize to 0-1
        reason: params.comment,
        category: "quality",
      },
    ],
    userId: params.userId,
  });
}
```

**Frontend Integration**:

```typescript
// components/FeedbackWidget.tsx

"use client";

import { useState } from "react";

export function FeedbackWidget({ traceId }: { traceId: string }) {
  const [submitted, setSubmitted] = useState(false);

  async function handleFeedback(thumbsUp: boolean) {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traceId, thumbsUp }),
    });

    setSubmitted(true);
  }

  if (submitted) {
    return <div className="text-sm text-green-600">Thanks for your feedback!</div>;
  }

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-gray-600">Was this helpful?</span>
      <button
        onClick={() => handleFeedback(true)}
        className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded"
      >
        👍 Yes
      </button>
      <button
        onClick={() => handleFeedback(false)}
        className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded"
      >
        👎 No
      </button>
    </div>
  );
}
```

```typescript
// app/api/feedback/route.ts

import { logThumbsFeedback } from "@/lib/opik/feedback";

export async function POST(request: Request) {
  const { traceId, thumbsUp, comment } = await request.json();

  await logThumbsFeedback({
    traceId,
    thumbsUp,
    comment,
  });

  return Response.json({ success: true });
}
```

---

## Part 4: Prompt Management

### 4.1 Versioned Prompt Library

**Purpose**: Manage, version, and collaborate on prompts across the team.

```typescript
// lib/opik/prompts.ts

import { getOpikClient } from "./config";

/**
 * Prompt template with variables
 */
export interface PromptTemplate {
  name: string;
  template: string;
  variables: string[];
  description?: string;
  tags?: string[];
}

/**
 * Create or update a prompt template
 */
export async function savePrompt(prompt: PromptTemplate): Promise<void> {
  const opikClient = getOpikClient();
  if (!opikClient) throw new Error("Opik not configured");

  const opikPrompt = new opikClient.Prompt({
    name: prompt.name,
    prompt: prompt.template,
    metadata: {
      description: prompt.description,
      variables: prompt.variables,
      tags: prompt.tags,
    },
  });

  await opikPrompt.commit();

  console.log(`✅ Saved prompt: ${prompt.name}`);
}

/**
 * Get latest version of a prompt
 */
export async function getPrompt(name: string): Promise<string | null> {
  const opikClient = getOpikClient();
  if (!opikClient) return null;

  try {
    const prompt = await opikClient.getPrompt({ name });
    return prompt.prompt;
  } catch (error) {
    console.error(`Failed to get prompt ${name}:`, error);
    return null;
  }
}

/**
 * Format a prompt with variables
 */
export function formatPrompt(template: string, variables: Record<string, any>): string {
  let formatted = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    formatted = formatted.replace(placeholder, String(value));
  }

  return formatted;
}
```

**Centralized Prompts**:

```typescript
// lib/opik/prompts/registry.ts

import { savePrompt, type PromptTemplate } from "../prompts";

/**
 * Impact Circle Prompt Library
 */
export const PROMPTS: Record<string, PromptTemplate> = {
  SKILL_MATCHER_V1: {
    name: "skill_matcher_v1",
    description: "Match volunteers with opportunities based on skills and interests",
    template: `You are a skill matching expert for Impact Circle.

User Profile:
- Skills: {{ skills }}
- Interests: {{ interests }}
- Location: {{ location }}
- Availability: {{ availability }}

Available Opportunities:
{{ opportunities }}

Task: Match the user with the top 5 most suitable opportunities.

For each match, provide:
1. Match score (0-100)
2. Reasons for the match
3. Specific skills that align
4. Potential impact

Respond in JSON format.`,
    variables: ["skills", "interests", "location", "availability", "opportunities"],
    tags: ["skill-matcher", "matching", "v1"],
  },

  ENGAGEMENT_COACH_V1: {
    name: "engagement_coach_v1",
    description: "Generate personalized engagement advice for volunteers",
    template: `You are an engagement coach for Impact Circle volunteers.

Volunteer Context:
- Name: {{ name }}
- Join Date: {{ joinDate }}
- Activities Completed: {{ activitiesCompleted }}
- Recent Engagement: {{ recentEngagement }}
- Goals: {{ goals }}

Task: Provide personalized engagement advice to increase participation.

Include:
1. Specific actionable recommendations (3-5)
2. Motivation strategies tailored to their profile
3. Suggested next opportunities
4. Timeline for achieving their goals

Be encouraging, specific, and actionable.`,
    variables: ["name", "joinDate", "activitiesCompleted", "recentEngagement", "goals"],
    tags: ["engagement-coach", "coaching", "v1"],
  },

  // Add prompts for all 6 agents...
};

/**
 * Initialize all prompts in Opik
 */
export async function initializePrompts(): Promise<void> {
  console.log("🔄 Initializing Opik prompt library...");

  for (const prompt of Object.values(PROMPTS)) {
    await savePrompt(prompt);
  }

  console.log(`✅ Initialized ${Object.keys(PROMPTS).length} prompts`);
}
```

---

## Part 5: Advanced Metrics & Evaluators

### 5.1 Custom Metric Library

```typescript
// lib/opik/metrics/custom.ts

import type { EvaluationMetric } from "../evaluations";

/**
 * Response time metric
 */
export const responseTimeMetric: EvaluationMetric = async ({ output }) => {
  const duration = output.metadata?.duration_ms || 0;

  // Score based on response time (faster is better)
  // < 1s = 1.0, 1-3s = 0.8, 3-5s = 0.5, > 5s = 0.2
  let score = 1.0;
  if (duration > 5000) score = 0.2;
  else if (duration > 3000) score = 0.5;
  else if (duration > 1000) score = 0.8;

  return {
    name: "response_time",
    value: score,
    reason: `Response time: ${duration}ms`,
  };
};

/**
 * Confidence calibration metric
 */
export const confidenceCalibrationMetric: EvaluationMetric = async ({
  output,
  expectedOutput,
}) => {
  const confidence = output.confidence || 0.5;
  const isCorrect = output.matches?.length > 0 && expectedOutput?.matches?.length > 0;

  // Well-calibrated if high confidence + correct OR low confidence + incorrect
  const calibrationScore = isCorrect
    ? confidence
    : 1 - confidence;

  return {
    name: "confidence_calibration",
    value: calibrationScore,
    reason: `Confidence: ${confidence.toFixed(2)}, Correct: ${isCorrect}`,
  };
};

/**
 * Personalization metric
 */
export const personalizationMetric: EvaluationMetric = async ({
  input,
  output,
}) => {
  const { getModel } = await import("@/lib/gemini/config");
  const model = getModel("EVAL", false);

  const prompt = `Evaluate how personalized this response is to the user's context.

User Context: ${JSON.stringify(input, null, 2)}
Response: ${JSON.stringify(output, null, 2)}

Score personalization from 0-100:
- 0: Generic, could apply to anyone
- 50: Some personalization, mentions user context
- 100: Highly personalized, deeply tailored to user's specific situation

Respond with JSON:
{
  "score": <number>,
  "reason": "<explanation>",
  "personalizations": ["<element 1>", "<element 2>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    name: "personalization",
    value: parsed.score / 100,
    reason: parsed.reason,
  };
};

/**
 * Actionability metric
 */
export const actionabilityMetric: EvaluationMetric = async ({ output }) => {
  const { getModel } = await import("@/lib/gemini/config");
  const model = getModel("EVAL", false);

  const prompt = `Evaluate how actionable this agent response is.

Response: ${JSON.stringify(output, null, 2)}

Score actionability from 0-100:
- 0: Vague, no clear actions
- 50: Some actions, but not specific
- 100: Clear, specific, immediately actionable steps

Respond with JSON:
{
  "score": <number>,
  "reason": "<explanation>",
  "actions_found": <number>
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    name: "actionability",
    value: parsed.score / 100,
    reason: parsed.reason,
  };
};
```

---

## Part 6: Spans & Nested Traces

### 6.1 Granular Operation Tracking

**Purpose**: Track sub-operations within agents for detailed performance analysis.

```typescript
// lib/opik/spans.ts

import { getOpikClient } from "./config";

/**
 * Enhanced trace with span support
 */
export async function traceAgentCallWithSpans<T>(
  agentName: string,
  input: any,
  agentFunction: (helpers: {
    createSpan: (name: string) => SpanHelper;
  }) => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const opikClient = getOpikClient();

  if (!opikClient) {
    return await agentFunction({
      createSpan: () => new NoOpSpanHelper(),
    });
  }

  const trace = opikClient.trace({
    name: agentName,
    input,
    metadata,
    tags: [agentName, "agent"],
  });

  const startTime = Date.now();

  try {
    const output = await agentFunction({
      createSpan: (name: string) => new OpikSpanHelper(trace, name),
    });

    const duration = Date.now() - startTime;

    trace.update({
      output: output as any,
      metadata: {
        ...metadata,
        success: true,
        duration_ms: duration,
      },
      tags: [agentName, "agent", "success"],
    });

    trace.end();
    opikClient.flush().catch(console.error);

    return output;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    trace.update({
      output: { error: errorMessage },
      metadata: {
        ...metadata,
        success: false,
        duration_ms: duration,
        errorMessage,
      },
      tags: [agentName, "agent", "error"],
    });

    trace.end();
    opikClient.flush().catch(console.error);

    throw error;
  }
}

/**
 * Span helper interface
 */
export interface SpanHelper {
  end(output?: any): void;
  error(error: Error): void;
}

/**
 * Opik span implementation
 */
class OpikSpanHelper implements SpanHelper {
  private span: any;
  private startTime: number;

  constructor(trace: any, name: string) {
    this.startTime = Date.now();
    this.span = trace.span({
      name,
      input: {},
      type: "general",
    });
  }

  end(output?: any): void {
    const duration = Date.now() - this.startTime;

    this.span.update({
      output: output || {},
      metadata: {
        success: true,
        duration_ms: duration,
      },
    });

    this.span.end();
  }

  error(error: Error): void {
    const duration = Date.now() - this.startTime;

    this.span.update({
      output: { error: error.message },
      metadata: {
        success: false,
        duration_ms: duration,
        errorMessage: error.message,
      },
    });

    this.span.end();
  }
}

/**
 * No-op span for when Opik is disabled
 */
class NoOpSpanHelper implements SpanHelper {
  end(): void {}
  error(): void {}
}
```

**Example Usage**:

```typescript
// lib/ai/agents/skill-matcher-with-spans.ts

import { traceAgentCallWithSpans } from "@/lib/opik/spans";

export async function matchUserWithOpportunitiesDetailed(userId: string) {
  return await traceAgentCallWithSpans(
    "skill_matcher",
    { userId },
    async ({ createSpan }) => {
      // Span 1: Fetch user profile
      const fetchUserSpan = createSpan("fetch_user_profile");
      let user;
      try {
        user = await getUserProfile(userId);
        fetchUserSpan.end({ userId, skillsCount: user.skills.length });
      } catch (error) {
        fetchUserSpan.error(error as Error);
        throw error;
      }

      // Span 2: Fetch opportunities
      const fetchOppsSpan = createSpan("fetch_opportunities");
      let opportunities;
      try {
        opportunities = await getOpportunities();
        fetchOppsSpan.end({ count: opportunities.length });
      } catch (error) {
        fetchOppsSpan.error(error as Error);
        throw error;
      }

      // Span 3: LLM matching
      const llmSpan = createSpan("llm_skill_matching");
      let matches;
      try {
        const model = getModel("FLASH", false);
        const result = await model.generateContent(buildPrompt(user, opportunities));
        matches = parseMatches(result.response.text());
        llmSpan.end({ matchesFound: matches.length });
      } catch (error) {
        llmSpan.error(error as Error);
        throw error;
      }

      // Span 4: Score calculation
      const scoreSpan = createSpan("calculate_scores");
      try {
        const scoredMatches = await scoreMatches(matches, user);
        scoreSpan.end({ topScore: scoredMatches[0]?.score });
        return scoredMatches;
      } catch (error) {
        scoreSpan.error(error as Error);
        throw error;
      }
    }
  );
}
```

---

## Part 7: Online Evaluations (Real-Time)

### 7.1 Automatic Real-Time Scoring

**Purpose**: Score every production trace automatically using LLM-as-judge.

```typescript
// lib/opik/online-evaluations.ts

import { getOpikClient } from "./config";
import { relevanceMetric, hallucinationMetric } from "./evaluations";
import type { EvaluationMetric } from "./evaluations";

/**
 * Configure automatic online evaluation
 */
export async function enableOnlineEvaluation(config: {
  agentName: string;
  metrics: EvaluationMetric[];
  sampleRate?: number; // 0.0 - 1.0, default 1.0 (evaluate all traces)
}): Promise<void> {
  const sampleRate = config.sampleRate || 1.0;

  console.log(
    `✅ Online evaluation enabled for ${config.agentName} (sample rate: ${sampleRate})`
  );

  // Store configuration for use in trace callbacks
  ONLINE_EVAL_CONFIG.set(config.agentName, {
    metrics: config.metrics,
    sampleRate,
  });
}

const ONLINE_EVAL_CONFIG = new Map<
  string,
  {
    metrics: EvaluationMetric[];
    sampleRate: number;
  }
>();

/**
 * Enhanced traceAgentCall with automatic online evaluation
 */
export async function traceAgentCallWithEval<T>(
  agentName: string,
  input: any,
  agentFunction: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const opikClient = getOpikClient();

  if (!opikClient) {
    return await agentFunction();
  }

  const trace = opikClient.trace({
    name: agentName,
    input,
    metadata,
    tags: [agentName, "agent"],
  });

  const startTime = Date.now();

  try {
    const output = await agentFunction();
    const duration = Date.now() - startTime;

    trace.update({
      output: output as any,
      metadata: {
        ...metadata,
        success: true,
        duration_ms: duration,
      },
      tags: [agentName, "agent", "success"],
    });

    trace.end();

    // Run online evaluation asynchronously (don't block response)
    runOnlineEvaluation(trace.id, agentName, input, output).catch((error) =>
      console.error("Online evaluation failed:", error)
    );

    opikClient.flush().catch(console.error);

    return output;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    trace.update({
      output: { error: errorMessage },
      metadata: {
        ...metadata,
        success: false,
        duration_ms: duration,
        errorMessage,
      },
      tags: [agentName, "agent", "error"],
    });

    trace.end();
    opikClient.flush().catch(console.error);

    throw error;
  }
}

/**
 * Run evaluation metrics asynchronously after trace completes
 */
async function runOnlineEvaluation(
  traceId: string,
  agentName: string,
  input: any,
  output: any
): Promise<void> {
  const config = ONLINE_EVAL_CONFIG.get(agentName);
  if (!config) return;

  // Sample based on configured rate
  if (Math.random() > config.sampleRate) return;

  const opikClient = getOpikClient();
  if (!opikClient) return;

  console.log(`🔍 Running online evaluation for trace ${traceId}...`);

  // Run all configured metrics
  for (const metric of config.metrics) {
    try {
      const result = await metric({ input, output });

      // Log score to trace
      await opikClient.logFeedbackScore({
        traceId,
        name: result.name,
        value: result.value,
        reason: result.reason,
        categoryName: "automated_evaluation",
      });

      console.log(
        `   ✅ ${result.name}: ${(result.value * 100).toFixed(1)}% - ${result.reason}`
      );
    } catch (error) {
      console.error(`   ❌ Metric ${metric.name} failed:`, error);
    }
  }
}
```

**Enable for all agents**:

```typescript
// lib/opik/setup-online-eval.ts

import { enableOnlineEvaluation } from "./online-evaluations";
import {
  relevanceMetric,
  hallucinationMetric,
  accuracyMetric,
} from "./evaluations";
import {
  personalizationMetric,
  actionabilityMetric,
} from "./metrics/custom";

/**
 * Initialize online evaluation for all agents
 */
export async function setupOnlineEvaluations(): Promise<void> {
  // Skill Matcher
  await enableOnlineEvaluation({
    agentName: "skill_matcher",
    metrics: [relevanceMetric, accuracyMetric, personalizationMetric],
    sampleRate: 0.1, // Evaluate 10% of traces (reduce cost)
  });

  // Community Intelligence
  await enableOnlineEvaluation({
    agentName: "community_intelligence",
    metrics: [relevanceMetric, hallucinationMetric, actionabilityMetric],
    sampleRate: 0.2,
  });

  // Engagement Coach
  await enableOnlineEvaluation({
    agentName: "engagement_coach",
    metrics: [personalizationMetric, actionabilityMetric],
    sampleRate: 0.15,
  });

  // Impact Measurement
  await enableOnlineEvaluation({
    agentName: "impact_measurement",
    metrics: [hallucinationMetric, accuracyMetric],
    sampleRate: 0.25,
  });

  // Action Coordinator
  await enableOnlineEvaluation({
    agentName: "action_coordinator",
    metrics: [relevanceMetric, actionabilityMetric],
    sampleRate: 0.1,
  });

  // Master Coordinator
  await enableOnlineEvaluation({
    agentName: "master_coordinator",
    metrics: [accuracyMetric],
    sampleRate: 1.0, // Evaluate all coordinator traces
  });

  console.log("✅ Online evaluations configured for all agents");
}
```

---

## Part 8: Production Monitoring & Alerting

### 8.1 Dashboard Integration

```typescript
// lib/opik/monitoring.ts

import { getOpikClient } from "./config";

export interface AgentHealthMetrics {
  agent: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalCalls: number;
    successRate: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    totalCost: number;
    averageFeedbackScore: number;
  };
  topErrors: Array<{
    message: string;
    count: number;
  }>;
}

/**
 * Get agent health metrics from Opik
 * (This would use Opik's REST API to fetch historical data)
 */
export async function getAgentHealth(
  agentName: string,
  hours: number = 24
): Promise<AgentHealthMetrics> {
  // TODO: Implement using Opik REST API
  // For now, return placeholder
  console.warn(`getAgentHealth for ${agentName} not yet implemented`);

  return {
    agent: agentName,
    period: {
      start: new Date(Date.now() - hours * 60 * 60 * 1000),
      end: new Date(),
    },
    metrics: {
      totalCalls: 0,
      successRate: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      errorRate: 0,
      totalCost: 0,
      averageFeedbackScore: 0,
    },
    topErrors: [],
  };
}

/**
 * Check if agent metrics exceed thresholds
 */
export async function checkAgentAlerts(agentName: string): Promise<{
  healthy: boolean;
  alerts: string[];
}> {
  const health = await getAgentHealth(agentName, 1);
  const alerts: string[] = [];

  // Error rate alert
  if (health.metrics.errorRate > 0.05) {
    // > 5%
    alerts.push(
      `High error rate: ${(health.metrics.errorRate * 100).toFixed(1)}%`
    );
  }

  // Latency alert
  if (health.metrics.p95Latency > 5000) {
    // > 5s
    alerts.push(`High latency: P95 = ${health.metrics.p95Latency}ms`);
  }

  // Cost alert
  if (health.metrics.totalCost > 10) {
    // > $10/hour
    alerts.push(`High cost: $${health.metrics.totalCost.toFixed(2)}/hour`);
  }

  // Feedback alert
  if (health.metrics.averageFeedbackScore < 0.7) {
    // < 70%
    alerts.push(
      `Low user satisfaction: ${(health.metrics.averageFeedbackScore * 100).toFixed(1)}%`
    );
  }

  return {
    healthy: alerts.length === 0,
    alerts,
  };
}
```

---

## Part 9: Budget & Cost Management

```typescript
// lib/opik/budget.ts

import { calculateModelCost } from "./config";
import { getOpikClient } from "./config";

export interface BudgetConfig {
  agentName: string;
  dailyLimit: number; // USD
  monthlyLimit: number; // USD
  alertThreshold: number; // 0.0 - 1.0 (e.g., 0.8 = alert at 80%)
}

const BUDGET_TRACKER = new Map<
  string,
  {
    config: BudgetConfig;
    dailySpend: number;
    monthlySpend: number;
    lastReset: Date;
  }
>();

/**
 * Set budget limits for an agent
 */
export function setBudget(config: BudgetConfig): void {
  BUDGET_TRACKER.set(config.agentName, {
    config,
    dailySpend: 0,
    monthlySpend: 0,
    lastReset: new Date(),
  });

  console.log(
    `✅ Budget set for ${config.agentName}: $${config.dailyLimit}/day, $${config.monthlyLimit}/month`
  );
}

/**
 * Track cost for an agent call
 */
export function trackCost(
  agentName: string,
  modelName: string,
  inputTokens: number,
  outputTokens: number
): {
  cost: number;
  withinBudget: boolean;
  alert?: string;
} {
  const cost = calculateModelCost(modelName, inputTokens, outputTokens);

  const tracker = BUDGET_TRACKER.get(agentName);
  if (!tracker) {
    return { cost, withinBudget: true };
  }

  // Reset if new day/month
  const now = new Date();
  if (now.getDate() !== tracker.lastReset.getDate()) {
    tracker.dailySpend = 0;
  }
  if (now.getMonth() !== tracker.lastReset.getMonth()) {
    tracker.monthlySpend = 0;
  }
  tracker.lastReset = now;

  // Add cost
  tracker.dailySpend += cost;
  tracker.monthlySpend += cost;

  // Check limits
  const dailyPercent = tracker.dailySpend / tracker.config.dailyLimit;
  const monthlyPercent = tracker.monthlySpend / tracker.config.monthlyLimit;

  let withinBudget = true;
  let alert: string | undefined;

  if (dailyPercent >= 1.0) {
    withinBudget = false;
    alert = `Daily budget exceeded: $${tracker.dailySpend.toFixed(4)} / $${tracker.config.dailyLimit}`;
  } else if (monthlyPercent >= 1.0) {
    withinBudget = false;
    alert = `Monthly budget exceeded: $${tracker.monthlySpend.toFixed(2)} / $${tracker.config.monthlyLimit}`;
  } else if (
    dailyPercent >= tracker.config.alertThreshold ||
    monthlyPercent >= tracker.config.alertThreshold
  ) {
    alert = `Budget alert: ${Math.max(dailyPercent, monthlyPercent) * 100}% of limit reached`;
  }

  if (alert) {
    console.warn(`⚠️ ${agentName}: ${alert}`);
  }

  return { cost, withinBudget, alert };
}

/**
 * Get budget status for an agent
 */
export function getBudgetStatus(agentName: string): {
  dailySpend: number;
  dailyLimit: number;
  dailyRemaining: number;
  monthlySpend: number;
  monthlyLimit: number;
  monthlyRemaining: number;
} | null {
  const tracker = BUDGET_TRACKER.get(agentName);
  if (!tracker) return null;

  return {
    dailySpend: tracker.dailySpend,
    dailyLimit: tracker.config.dailyLimit,
    dailyRemaining: tracker.config.dailyLimit - tracker.dailySpend,
    monthlySpend: tracker.monthlySpend,
    monthlyLimit: tracker.config.monthlyLimit,
    monthlyRemaining: tracker.config.monthlyLimit - tracker.monthlySpend,
  };
}
```

---

## Implementation Timeline

### Phase 1: Evaluation Foundation (Week 1)
- ✅ Datasets implementation
- ✅ Basic evaluations (relevance, accuracy, hallucination)
- ✅ Experiment framework
- 🎯 **Goal**: Run first A/B test comparing prompt variants

### Phase 2: Production Feedback (Week 2)
- ✅ Feedback collection API
- ✅ Frontend feedback widgets
- ✅ Annotations system
- 🎯 **Goal**: Collect 100+ user feedback samples

### Phase 3: Advanced Metrics (Week 3)
- ✅ Custom metrics library
- ✅ Spans & nested traces
- ✅ Online evaluations setup
- 🎯 **Goal**: Automatic evaluation on 10% of production traffic

### Phase 4: Operational Excellence (Week 4)
- ✅ Prompt management system
- ✅ Budget tracking & alerts
- ✅ Monitoring dashboard
- 🎯 **Goal**: Full production observability

---

## Success Metrics

After full implementation, you'll have:

1. **100% Trace Coverage** - Every agent call traced
2. **Automated Evaluation** - 10-20% of traces auto-scored
3. **Human Feedback** - User ratings on key interactions
4. **Experiment Capability** - A/B test any change
5. **Prompt Versioning** - Collaborative prompt management
6. **Cost Visibility** - Real-time budget tracking per agent
7. **Production Alerts** - Proactive issue detection
8. **Performance Insights** - Detailed latency breakdowns with spans

---

## Next Steps

1. **Review this plan** and prioritize features
2. **Choose Phase 1 features** to implement first
3. **Set up development environment** for Opik experiments
4. **Begin implementation** starting with datasets

Would you like me to implement any specific features from this plan right now?
