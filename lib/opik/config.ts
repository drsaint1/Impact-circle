/**
 * Opik Configuration - Singleton Client with Authenticated Fetch
 *
 * This module provides the Opik client configuration for tracing AI agents.
 * It implements a custom fetch wrapper to fix authentication issues in Next.js
 * serverless environments.
 *
 * Key Features:
 * - Singleton pattern for Opik client instance
 * - Authenticated fetch wrapper for Opik API calls
 * - Environment variable management for serverless contexts
 * - Model cost tracking configuration
 * - Graceful shutdown handling
 *
 * @module lib/opik/config
 * @see https://www.comet.com/docs/opik/integrations/typescript-sdk
 */

import { Opik } from "opik";

// Singleton instance
let opikClient: Opik | null = null;
let isInitialized = false;

/**
 * Creates an authenticated fetch wrapper for Opik API calls
 *
 * This fixes the batch queue 401 errors in Next.js serverless environments
 * by ensuring authentication headers are present on every Opik API request.
 *
 * IMPORTANT: Only intercepts Opik API calls, not other requests (CSS, images, etc.)
 *
 * @param apiKey - Opik API key
 * @param workspace - Opik workspace name
 * @returns Wrapped fetch function with automatic authentication
 */
function createAuthenticatedFetch(apiKey: string, workspace: string) {
  const originalFetch = globalThis.fetch.bind(globalThis);

  return async function authenticatedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Extract URL from various input types
    let url: string;
    try {
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.href;
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        url = "";
      }
    } catch {
      return originalFetch(input, init);
    }

    // Only intercept Opik API requests
    const isOpikRequest =
      url.includes("comet.com/opik/api") ||
      url.includes("localhost:5173/api"); // Self-hosted Opik

    if (isOpikRequest) {
      const headers = new Headers(init?.headers || {});

      // Inject authentication headers
      if (!headers.has("Authorization")) {
        headers.set("Authorization", apiKey);
      }
      if (!headers.has("Comet-Workspace")) {
        headers.set("Comet-Workspace", workspace);
      }

      return originalFetch(input, { ...init, headers });
    }

    // Pass through all non-Opik requests unchanged
    return originalFetch(input, init);
  };
}

/**
 * Get or create the Opik client instance (singleton)
 *
 * This function:
 * 1. Checks for server context (returns null on client)
 * 2. Validates environment variables
 * 3. Re-applies fetch wrapper on every call (for serverless)
 * 4. Creates Opik instance on first call
 * 5. Returns existing instance on subsequent calls
 *
 * @returns Opik client instance or null if not configured
 *
 * @example
 * ```typescript
 * const opik = getOpikClient();
 * if (opik) {
 *   const trace = opik.trace({ name: "my_agent", input: data });
 *   // ... trace operations
 *   trace.end();
 *   await opik.flush();
 * }
 * ```
 */
export function getOpikClient(): Opik | null {
  // Only run in server context
  if (typeof window !== "undefined") {
    return null;
  }

  // Load configuration from environment variables
  const apiKey = process.env.OPIK_API_KEY;
  const workspace = process.env.OPIK_WORKSPACE_NAME;
  const projectName = process.env.OPIK_PROJECT_NAME || "impact-circle";
  const apiUrl = process.env.OPIK_URL_OVERRIDE || "https://www.comet.com/opik/api";

  // Return null if not configured
  if (!apiKey || !workspace) {
    if (!isInitialized) {
      console.warn("⚠️ Opik not configured - missing API key or workspace");
      isInitialized = true;
    }
    return null;
  }

  try {
    // CRITICAL: Re-apply fetch wrapper on every call
    // Next.js serverless functions may have fresh global contexts
    const authenticatedFetch = createAuthenticatedFetch(apiKey, workspace);
    (globalThis as any).fetch = authenticatedFetch;

    // CRITICAL: Re-set environment variables on every call
    // Serverless functions may have fresh process.env
    process.env.OPIK_API_KEY = apiKey;
    process.env.OPIK_WORKSPACE = workspace;
    process.env.OPIK_WORKSPACE_NAME = workspace;
    process.env.OPIK_PROJECT_NAME = projectName;
    process.env.OPIK_URL_OVERRIDE = apiUrl;
    process.env.COMET_API_KEY = apiKey; // Fallback for Comet compatibility

    // Return existing instance if already initialized
    if (isInitialized && opikClient) {
      return opikClient;
    }

    // Create Opik instance (only once)
    opikClient = new Opik({
      apiKey,
      workspaceName: workspace,
      projectName,
      apiUrl,
    });

    isInitialized = true;
    console.log("✅ Opik client initialized with authenticated fetch wrapper");
    console.log(`   API Key: ${apiKey.substring(0, 8)}...`);
    console.log(`   Workspace: ${workspace}`);
    console.log(`   Project: ${projectName}`);
    console.log(`   URL: ${apiUrl}`);

    return opikClient;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to create Opik client:", errorMessage);
    isInitialized = true;
    return null;
  }
}

/**
 * Check if Opik is enabled and configured
 *
 * @returns true if OPIK_API_KEY and OPIK_WORKSPACE_NAME are set
 */
export function isOpikEnabled(): boolean {
  return !!process.env.OPIK_API_KEY && !!process.env.OPIK_WORKSPACE_NAME;
}

/**
 * Model cost configuration for cost tracking
 *
 * Prices are per 1 million tokens (input/output)
 */
export const MODEL_COSTS = {
  "gemini-2.0-flash-exp": {
    inputCostPer1M: 0.0,  // Free during experimental phase
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
} as const;

/**
 * Calculate the cost of a model call based on token usage
 *
 * @param modelName - Name of the model (must match MODEL_COSTS keys)
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Total cost in USD
 */
export function calculateModelCost(
  modelName: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[modelName as keyof typeof MODEL_COSTS];

  if (!costs) {
    console.warn(`Unknown model for cost calculation: ${modelName}`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * costs.inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * costs.outputCostPer1M;

  return inputCost + outputCost;
}

/**
 * Predefined tags for organizing traces in Opik
 */
export const TRACE_TAGS = {
  // Agent types
  SKILL_MATCHER: "skill-matcher",
  COMMUNITY_INTELLIGENCE: "community-intelligence",
  ACTION_COORDINATOR: "action-coordinator",
  IMPACT_MEASUREMENT: "impact-measurement",
  ENGAGEMENT_COACH: "engagement-coach",
  MASTER_COORDINATOR: "master-coordinator",

  // Operation types
  LLM_CALL: "llm-call",
  EVALUATION: "evaluation",
  EXPERIMENT: "experiment",
  API_CALL: "api-call",

  // Status tags
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",

  // Environment tags
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  TEST: "test",
} as const;

/**
 * Get the appropriate environment tag based on NODE_ENV
 *
 * @returns Environment tag (production, development, or test)
 */
export function getEnvironmentTag(): string {
  const env = process.env.NODE_ENV || "development";
  return TRACE_TAGS[env.toUpperCase() as keyof typeof TRACE_TAGS] || TRACE_TAGS.DEVELOPMENT;
}

/**
 * Flush all pending traces to Opik
 *
 * Call this before shutting down to ensure all traces are sent
 */
export async function flushTraces(): Promise<void> {
  const client = getOpikClient();
  if (!client) return;

  try {
    await client.flush();
    console.log("✅ Opik traces flushed successfully");
  } catch (error) {
    console.error("❌ Failed to flush Opik traces:", error);
  }
}

/**
 * Graceful shutdown handler for Opik
 *
 * Flushes all pending traces before shutdown
 */
export async function shutdownOpik(): Promise<void> {
  console.log("🔄 Shutting down Opik...");
  await flushTraces();
  console.log("✅ Opik shutdown complete");
}

// Register shutdown handler (only in Node.js server context)
if (typeof process !== "undefined" && typeof window === "undefined") {
  process.on("beforeExit", () => {
    shutdownOpik().catch(console.error);
  });
}
