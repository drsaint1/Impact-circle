/**
 * Opik-Integrated Gemini Wrapper
 *
 * This module provides a wrapper around Google's Generative AI SDK with automatic
 * Opik tracing for LLM calls. It tracks token usage, costs, latency, and errors.
 *
 * Architecture:
 * - Uses manual tracing via TrackedGenerativeModel class
 * - Traces streaming and token counting operations
 * - Non-streaming calls use agent-level tracing instead (see lib/opik/client.ts)
 *
 * @module lib/opik/gemini-wrapper
 * @see https://www.comet.com/docs/opik/integrations/gemini
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import {
  getOpikClient,
  isOpikEnabled,
  calculateModelCost,
  TRACE_TAGS,
  getEnvironmentTag,
} from "./config";

// Validate required environment variables
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}

// Initialize Google Generative AI SDK
const baseGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * NOTE: Official opik-gemini package requires @google/genai (Google Deepmind's unified SDK)
 * This project uses @google/generative-ai, so we implement manual tracing instead.
 *
 * To migrate to official opik-gemini in the future:
 * 1. Install @google/genai package
 * 2. Replace @google/generative-ai with @google/genai
 * 3. Import and use trackGemini() from opik-gemini
 */
const genAI = baseGenAI;

// Log Opik tracing status
if (isOpikEnabled()) {
  console.log("✅ Using manual Opik tracing via TrackedGenerativeModel");
} else {
  console.log("ℹ️ Opik tracing disabled (missing API key or workspace)");
}

export { genAI };

/**
 * Enhanced Generative Model with Opik Tracing
 *
 * This class wraps Google's GenerativeModel to automatically trace:
 * - Streaming content generation (with token counts and costs)
 * - Token counting operations
 *
 * Non-streaming calls skip model-level tracing to avoid SDK batch queue issues.
 * Instead, use agent-level tracing via traceAgentCall() from lib/opik/client.ts.
 *
 * @example
 * ```typescript
 * const model = new TrackedGenerativeModel("gemini-2.0-flash-exp", {
 *   agent: "skill_matcher",
 *   userId: "123"
 * });
 *
 * // Streaming generation (automatically traced)
 * const stream = model.generateContentStream("Hello", {
 *   operation: "generate_greeting",
 *   tags: ["greeting"]
 * });
 *
 * // Token counting (automatically traced)
 * const count = await model.countTokens("Hello world");
 * ```
 */
export class TrackedGenerativeModel {
  private model: GenerativeModel;
  private modelName: string;
  private metadata: Record<string, any>;

  /**
   * Create a new tracked Gemini model instance
   *
   * @param modelName - Gemini model identifier (e.g., "gemini-2.0-flash-exp")
   * @param metadata - Optional metadata to attach to all traces from this model
   */
  constructor(modelName: string, metadata?: Record<string, any>) {
    this.modelName = modelName;
    this.metadata = metadata || {};
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Generate content (non-streaming)
   *
   * This method does NOT trace at the model level to avoid SDK batch queue issues.
   * Instead, wrap your agent calls with traceAgentCall() from lib/opik/client.ts
   * for comprehensive agent-level tracing.
   *
   * @param prompt - Text prompt or structured content
   * @param options - Optional tracing configuration (currently unused)
   * @returns Generated content result
   * @throws Error if generation fails
   */
  async generateContent(
    prompt: string | any,
    options?: {
      operation?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<any> {
    // Skip model-level tracing - use agent-level tracing instead
    // This prevents SDK batch queue 401 errors in serverless environments
    try {
      const result = await this.model.generateContent(prompt);
      return result;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Generate content stream with automatic Opik tracing
   *
   * This method traces the entire streaming operation, including:
   * - Input prompt
   * - Streamed chunks count
   * - Final output text
   * - Token usage (input/output/total)
   * - Model cost calculation
   * - Latency measurements
   * - Success/error status
   *
   * @param prompt - Text prompt or structured content
   * @param options - Tracing configuration
   * @param options.operation - Human-readable operation name (defaults to "gemini_generate_stream")
   * @param options.tags - Additional tags for filtering traces
   * @param options.metadata - Additional metadata to attach
   * @yields Chunks of generated content
   * @throws Error if generation fails
   *
   * @example
   * ```typescript
   * const model = createTrackedModel("gemini-2.0-flash-exp");
   * const stream = model.generateContentStream("Tell me a joke", {
   *   operation: "joke_generation",
   *   tags: ["entertainment"],
   *   metadata: { userId: "123" }
   * });
   *
   * for await (const chunk of stream) {
   *   console.log(chunk.text());
   * }
   * ```
   */
  async *generateContentStream(
    prompt: string | any,
    options?: {
      operation?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): AsyncGenerator<any, void, unknown> {
    const opikClient = getOpikClient();
    const startTime = Date.now();

    // Create Opik trace for this streaming operation
    const trace = opikClient?.trace({
      name: options?.operation || "gemini_generate_stream",
      input: typeof prompt === "string" ? { prompt } : prompt,
      metadata: {
        model: this.modelName,
        operation: options?.operation,
        streaming: true,
        environment: getEnvironmentTag(),
        ...this.metadata,
        ...options?.metadata,
      },
      tags: [
        TRACE_TAGS.LLM_CALL,
        "streaming",
        this.modelName,
        getEnvironmentTag(),
        ...(options?.tags || []),
      ],
    });

    try {
      const result = await this.model.generateContentStream(prompt);
      let fullText = "";
      let chunkCount = 0;

      // Stream chunks and yield to caller
      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullText += text;
        chunkCount++;
        yield chunk;
      }

      const duration = Date.now() - startTime;

      // Get final usage metadata from Gemini
      const response = await result.response;
      const usageMetadata = (response as any).usageMetadata;
      const inputTokens = usageMetadata?.promptTokenCount || 0;
      const outputTokens = usageMetadata?.candidatesTokenCount || 0;
      const totalTokens =
        usageMetadata?.totalTokenCount || inputTokens + outputTokens;

      // Calculate cost based on model pricing
      const cost = calculateModelCost(
        this.modelName,
        inputTokens,
        outputTokens
      );

      // Update trace with final results
      trace?.update({
        output: { text: fullText, length: fullText.length, chunks: chunkCount },
        metadata: {
          model: this.modelName,
          duration_ms: duration,
          inputTokens,
          outputTokens,
          totalTokens,
          cost,
          chunkCount,
          success: true,
          ...this.metadata,
          ...options?.metadata,
        },
        tags: [
          TRACE_TAGS.LLM_CALL,
          TRACE_TAGS.SUCCESS,
          "streaming",
          this.modelName,
          getEnvironmentTag(),
          ...(options?.tags || []),
        ],
      });

      trace?.end();
      opikClient
        ?.flush()
        .catch((err) => console.error("Failed to flush Opik trace:", err));
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Update trace with error information
      trace?.update({
        output: { error: error.message || String(error) },
        metadata: {
          model: this.modelName,
          duration_ms: duration,
          success: false,
          errorMessage: error.message || String(error),
          ...this.metadata,
          ...options?.metadata,
        },
        tags: [
          TRACE_TAGS.LLM_CALL,
          TRACE_TAGS.ERROR,
          "streaming",
          this.modelName,
          getEnvironmentTag(),
          ...(options?.tags || []),
        ],
      });

      trace?.end();
      opikClient
        ?.flush()
        .catch((err) => console.error("Failed to flush Opik trace:", err));

      throw error;
    }
  }

  /**
   * Count tokens in content with automatic Opik tracing
   *
   * Useful for estimating costs before making actual LLM calls.
   * Traces the token counting operation with the result.
   *
   * @param content - Text or structured content to count tokens for
   * @param options - Tracing configuration
   * @param options.operation - Human-readable operation name (defaults to "gemini_count_tokens")
   * @param options.metadata - Additional metadata to attach
   * @returns Total token count
   * @throws Error if token counting fails
   *
   * @example
   * ```typescript
   * const model = createTrackedModel("gemini-2.0-flash-exp");
   * const count = await model.countTokens("Hello world", {
   *   operation: "estimate_cost",
   *   metadata: { userId: "123" }
   * });
   * console.log(`Tokens: ${count}`);
   * ```
   */
  async countTokens(
    content: string | any,
    options?: {
      operation?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<number> {
    const opikClient = getOpikClient();

    // Create Opik trace for token counting
    const trace = opikClient?.trace({
      name: options?.operation || "gemini_count_tokens",
      input: typeof content === "string" ? { content } : content,
      metadata: {
        model: this.modelName,
        operation: "count_tokens",
        ...this.metadata,
        ...options?.metadata,
      },
      tags: ["token_count", this.modelName, getEnvironmentTag()],
    });

    try {
      const result = await this.model.countTokens(content);
      const tokenCount = result.totalTokens;

      // Update trace with token count result
      trace?.update({
        output: { tokenCount },
        metadata: {
          model: this.modelName,
          tokenCount,
          success: true,
          ...this.metadata,
          ...options?.metadata,
        },
      });

      trace?.end();
      opikClient?.flush().catch(() => {});

      return tokenCount;
    } catch (error: any) {
      // Update trace with error
      trace?.update({
        output: { error: error.message || String(error) },
        metadata: {
          model: this.modelName,
          success: false,
          errorMessage: error.message || String(error),
          ...this.metadata,
          ...options?.metadata,
        },
        tags: ["token_count", TRACE_TAGS.ERROR, this.modelName],
      });

      trace?.end();
      opikClient?.flush().catch(() => {});

      throw error;
    }
  }

  /**
   * Get the underlying Google GenerativeModel instance
   *
   * Use this if you need direct access to the unwrapped Gemini model
   * for operations not supported by TrackedGenerativeModel.
   *
   * @returns The underlying GenerativeModel instance
   */
  getModel(): GenerativeModel {
    return this.model;
  }
}

/**
 * Create a tracked Gemini model instance
 *
 * Factory function for creating TrackedGenerativeModel instances.
 * Preferred over direct class instantiation.
 *
 * @param modelName - Gemini model identifier (e.g., "gemini-2.0-flash-exp", "gemini-1.5-pro")
 * @param metadata - Optional metadata to attach to all traces from this model
 * @returns A new TrackedGenerativeModel instance
 *
 * @example
 * ```typescript
 * // Create a tracked model for an agent
 * const model = createTrackedModel("gemini-2.0-flash-exp", {
 *   agent: "skill_matcher",
 *   version: "v1"
 * });
 *
 * // Use the model with automatic tracing
 * const response = await model.generateContent("Hello");
 * ```
 */
export function createTrackedModel(
  modelName: string,
  metadata?: Record<string, any>
): TrackedGenerativeModel {
  return new TrackedGenerativeModel(modelName, metadata);
}
