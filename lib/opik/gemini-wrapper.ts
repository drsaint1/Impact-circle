import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import {
  getOpikClient,
  isOpikEnabled,
  calculateModelCost,
  TRACE_TAGS,
  getEnvironmentTag,
} from "./config";


if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}


const baseGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


const genAI = baseGenAI;


if (isOpikEnabled()) {
  console.log("✅ Using manual Opik tracing via TrackedGenerativeModel");
} else {
  console.log("ℹ️ Opik tracing disabled (missing API key or workspace)");
}

export { genAI };


export class TrackedGenerativeModel {
  private model: GenerativeModel;
  private modelName: string;
  private metadata: Record<string, any>;

  
  constructor(modelName: string, metadata?: Record<string, any>) {
    this.modelName = modelName;
    this.metadata = metadata || {};
    
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  
  async generateContent(
    prompt: string | any,
    options?: {
      operation?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    },
  ): Promise<any> {
    
    
    try {
      const result = await this.model.generateContent(prompt);
      return result;
    } catch (error: any) {
      throw error;
    }
  }

  
  async *generateContentStream(
    prompt: string | any,
    options?: {
      operation?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    },
  ): AsyncGenerator<any, void, unknown> {
    const opikClient = getOpikClient();
    const startTime = Date.now();

    
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

      
      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullText += text;
        chunkCount++;
        yield chunk;
      }

      const duration = Date.now() - startTime;

      
      const response = await result.response;
      const usageMetadata = (response as any).usageMetadata;
      const inputTokens = usageMetadata?.promptTokenCount || 0;
      const outputTokens = usageMetadata?.candidatesTokenCount || 0;
      const totalTokens =
        usageMetadata?.totalTokenCount || inputTokens + outputTokens;

      
      const cost = calculateModelCost(
        this.modelName,
        inputTokens,
        outputTokens,
      );

      
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

  
  async countTokens(
    content: string | any,
    options?: {
      operation?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<number> {
    const opikClient = getOpikClient();

    
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

  
  getModel(): GenerativeModel {
    return this.model;
  }
}


export function createTrackedModel(
  modelName: string,
  metadata?: Record<string, any>,
): TrackedGenerativeModel {
  return new TrackedGenerativeModel(modelName, metadata);
}