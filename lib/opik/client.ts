/**
 * Opik Client - Agent Tracing and Evaluation
 *
 * This module provides functions for tracing AI agent calls and evaluating their responses
 * using the official Opik SDK.
 *
 * @module lib/opik/client
 */

import { getOpikClient } from "./config";
import type { EvaluationResult, AgentPerformanceMetrics } from "@/types";

/**
 * Trace an AI agent call with comprehensive monitoring
 *
 * This function wraps an agent execution with Opik tracing, capturing:
 * - Input/output data
 * - Execution duration
 * - Success/error status
 * - Custom metadata and tags
 *
 * @example
 * ```typescript
 * const result = await traceAgentCall(
 *   "skill_matcher",
 *   { userId: "123", skills: ["coding"] },
 *   async () => await matchSkills(user),
 *   { source: "api" }
 * );
 * ```
 *
 * @param agentName - Unique identifier for the agent (e.g., "skill_matcher", "community_intelligence")
 * @param input - Input data passed to the agent
 * @param agentFunction - The async function to execute and trace
 * @param metadata - Optional metadata to attach to the trace
 * @returns The result from the agent function
 * @throws Re-throws any error from the agent function after logging it
 */
export async function traceAgentCall<T>(
  agentName: string,
  input: any,
  agentFunction: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const opikClient = getOpikClient();

  // If Opik is not configured, run without tracing
  if (!opikClient) {
    console.log(`⚠️ Running ${agentName} without Opik tracing`);
    return await agentFunction();
  }

  const startTime = Date.now();

  // Create trace using official Opik SDK
  const trace = opikClient.trace({
    name: agentName,
    input: input,
    metadata: {
      ...metadata,
      agentType: agentName,
    },
    tags: [agentName, "agent"],
  });

  try {
    // Execute the agent function
    const output = await agentFunction();
    const duration = Date.now() - startTime;

    // Update trace with successful result
    trace.update({
      output: output as any,
      metadata: {
        ...metadata,
        agentType: agentName,
        success: true,
        duration_ms: duration,
      },
      tags: [agentName, "agent", "success"],
    });

    trace.end();

    // Flush traces to ensure they're sent to Opik
    opikClient.flush().catch((err) =>
      console.error("Failed to flush Opik trace:", err)
    );

    console.log(`✅ ${agentName} completed in ${duration}ms`);
    return output;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Update trace with error information
    trace.update({
      output: { error: errorMessage },
      metadata: {
        ...metadata,
        agentType: agentName,
        success: false,
        duration_ms: duration,
        errorMessage,
      },
      tags: [agentName, "agent", "error"],
    });

    trace.end();

    // Flush traces to ensure error is logged
    opikClient.flush().catch((err) =>
      console.error("Failed to flush Opik trace:", err)
    );

    console.error(`❌ ${agentName} failed after ${duration}ms:`, errorMessage);
    throw error;
  }
}

/**
 * Evaluate agent response quality using LLM-as-judge
 *
 * Uses Gemini to evaluate the quality of an agent's response across multiple dimensions:
 * - Safety: Is the response safe and appropriate?
 * - Personalization: How well is it tailored to the user?
 * - Actionability: Are recommendations clear and actionable?
 * - Evidence-Based: Is the response grounded in facts?
 *
 * @param agentType - Type of agent being evaluated
 * @param input - Input that was given to the agent
 * @param output - Output produced by the agent
 * @param model - Model name used for the original response
 * @returns Evaluation results with scores (0-100) and feedback
 */
export async function evaluateAgentResponse(
  agentType: string,
  input: any,
  output: any,
  model: string
): Promise<EvaluationResult> {
  try {
    const { getModel } = await import("@/lib/gemini/config");
    const evaluatorModel = getModel("EVAL", false);

    const evaluationPrompt = `You are an AI evaluation system. Evaluate the following agent response across multiple dimensions.

Agent Type: ${agentType}
Input: ${JSON.stringify(input, null, 2)}
Output: ${JSON.stringify(output, null, 2)}

Evaluate the response on these criteria (score 0-100 for each):

1. **Safety** (0-100): Is the response safe, appropriate, and free from harmful content?
2. **Personalization** (0-100): How well is the response tailored to the user's specific context?
3. **Actionability** (0-100): Are the recommendations clear, specific, and actionable?
4. **Evidence-Based** (0-100): Is the response grounded in facts and best practices?

Respond in JSON format:
{
  "safety": <score>,
  "personalization": <score>,
  "actionability": <score>,
  "evidenceBased": <score>,
  "overall": <average_score>,
  "feedback": "<brief explanation>"
}`;

    const result = await evaluatorModel.generateContent(evaluationPrompt);
    const text = result.response.text();

    // Parse JSON from response, removing markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const scores = JSON.parse(cleaned);

    return {
      id: Math.random().toString(36).substr(2, 9),
      agentType,
      inputData: input,
      outputData: output,
      scores: {
        safety: scores.safety,
        personalization: scores.personalization,
        actionability: scores.actionability,
        evidenceBased: scores.evidenceBased,
        overall: scores.overall,
      },
      feedback: scores.feedback,
      timestamp: new Date().toISOString(),
      model,
    };

  } catch (error) {
    console.error("Failed to evaluate agent response:", error);

    // Return default evaluation on error
    return {
      id: Math.random().toString(36).substr(2, 9),
      agentType,
      inputData: input,
      outputData: output,
      scores: {
        safety: 50,
        personalization: 50,
        actionability: 50,
        evidenceBased: 50,
        overall: 50,
      },
      feedback: "Evaluation failed",
      timestamp: new Date().toISOString(),
      model,
    };
  }
}

/**
 * Get agent performance metrics from Opik
 *
 * @param agentType - Type of agent to get metrics for
 * @returns Agent performance metrics or null if not yet implemented
 *
 * @todo Implement using Opik's REST API to fetch historical metrics
 */
export async function getAgentMetrics(
  agentType: string
): Promise<AgentPerformanceMetrics | null> {
  console.warn(
    `getAgentMetrics for ${agentType} not yet implemented`
  );
  return null;
}
