import { getOpikClient } from "./config";


export interface SpanHelper {
  
  end(output?: any): void;

  
  error(error: Error | string): void;

  
  update(data: { metadata?: Record<string, any>; tags?: string[] }): void;
}


export interface TraceHelpers {
  
  createSpan(name: string, input?: any): SpanHelper;
}


export async function traceAgentCallWithSpans<T>(
  agentName: string,
  input: any,
  agentFunction: (helpers: TraceHelpers) => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const opikClient = getOpikClient();

  
  if (!opikClient) {
    console.log(`⚠️ Running ${agentName} without Opik tracing (no client)`);
    return await agentFunction({
      createSpan: () => new NoOpSpanHelper(),
    });
  }

  const trace = opikClient.trace({
    name: agentName,
    input,
    metadata,
    tags: [agentName, "agent", "with_spans"],
  });

  const startTime = Date.now();

  try {
    const output = await agentFunction({
      createSpan: (name: string, spanInput?: any) =>
        new OpikSpanHelper(trace, name, spanInput),
    });

    const duration = Date.now() - startTime;

    trace.update({
      output: output as any,
      metadata: {
        ...metadata,
        success: true,
        duration_ms: duration,
      },
      tags: [agentName, "agent", "with_spans", "success"],
    });

    trace.end();
    opikClient.flush().catch(console.error);

    console.log(`✅ ${agentName} completed in ${duration}ms (with spans)`);

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
      tags: [agentName, "agent", "with_spans", "error"],
    });

    trace.end();
    opikClient.flush().catch(console.error);

    console.error(`❌ ${agentName} failed after ${duration}ms:`, errorMessage);
    throw error;
  }
}


class OpikSpanHelper implements SpanHelper {
  private span: any;
  private startTime: number;
  private ended: boolean = false;

  constructor(trace: any, name: string, input?: any) {
    this.startTime = Date.now();
    this.span = trace.span({
      name,
      input: input || {},
      type: "general",
    });
  }

  end(output?: any): void {
    if (this.ended) return;

    const duration = Date.now() - this.startTime;

    this.span.update({
      output: output || {},
      metadata: {
        success: true,
        duration_ms: duration,
      },
    });

    this.span.end();
    this.ended = true;
  }

  error(error: Error | string): void {
    if (this.ended) return;

    const duration = Date.now() - this.startTime;
    const errorMessage = typeof error === "string" ? error : error.message;

    this.span.update({
      output: { error: errorMessage },
      metadata: {
        success: false,
        duration_ms: duration,
        errorMessage,
      },
    });

    this.span.end();
    this.ended = true;
  }

  update(data: { metadata?: Record<string, any>; tags?: string[] }): void {
    if (this.ended) return;

    this.span.update({
      metadata: data.metadata,
      tags: data.tags,
    });
  }
}


class NoOpSpanHelper implements SpanHelper {
  end(): void {}
  error(): void {}
  update(): void {}
}


export class SpanContext {
  private helpers: TraceHelpers;

  constructor(helpers: TraceHelpers) {
    this.helpers = helpers;
  }

  
  async withSpan<T>(
    name: string,
    operation: () => Promise<T>,
    input?: any
  ): Promise<T> {
    const span = this.helpers.createSpan(name, input);

    try {
      const result = await operation();
      span.end(result);
      return result;
    } catch (error) {
      span.error(error as Error);
      throw error;
    }
  }

  
  createSpan(name: string, input?: any): SpanHelper {
    return this.helpers.createSpan(name, input);
  }
}


export { SpanContext as default };