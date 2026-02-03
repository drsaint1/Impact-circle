import { Opik } from "opik";


let opikClient: Opik | null = null;
let isInitialized = false;


function createAuthenticatedFetch(apiKey: string, workspace: string) {
  const originalFetch = globalThis.fetch.bind(globalThis);

  return async function authenticatedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    
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

    
    const isOpikRequest =
      url.includes("comet.com/opik/api") ||
      url.includes("localhost:5173/api"); 

    if (isOpikRequest) {
      const headers = new Headers(init?.headers || {});

      
      if (!headers.has("Authorization")) {
        headers.set("Authorization", apiKey);
      }
      if (!headers.has("Comet-Workspace")) {
        headers.set("Comet-Workspace", workspace);
      }

      return originalFetch(input, { ...init, headers });
    }

    
    return originalFetch(input, init);
  };
}


export function getOpikClient(): Opik | null {
  
  if (typeof window !== "undefined") {
    return null;
  }

  
  const apiKey = process.env.OPIK_API_KEY;
  const workspace = process.env.OPIK_WORKSPACE_NAME;
  const projectName = process.env.OPIK_PROJECT_NAME || "impact-circle";
  const apiUrl = process.env.OPIK_URL_OVERRIDE || "https://www.comet.com/opik/api";

  
  if (!apiKey || !workspace) {
    if (!isInitialized) {
      console.warn("⚠️ Opik not configured - missing API key or workspace");
      isInitialized = true;
    }
    return null;
  }

  try {
    
    
    const authenticatedFetch = createAuthenticatedFetch(apiKey, workspace);
    (globalThis as any).fetch = authenticatedFetch;

    
    
    process.env.OPIK_API_KEY = apiKey;
    process.env.OPIK_WORKSPACE = workspace;
    process.env.OPIK_WORKSPACE_NAME = workspace;
    process.env.OPIK_PROJECT_NAME = projectName;
    process.env.OPIK_URL_OVERRIDE = apiUrl;
    process.env.COMET_API_KEY = apiKey; 

    
    if (isInitialized && opikClient) {
      return opikClient;
    }

    
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


export function isOpikEnabled(): boolean {
  return !!process.env.OPIK_API_KEY && !!process.env.OPIK_WORKSPACE_NAME;
}


export const MODEL_COSTS = {
  "gemini-2.0-flash-exp": {
    inputCostPer1M: 0.0,  
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


export const TRACE_TAGS = {
  
  SKILL_MATCHER: "skill-matcher",
  COMMUNITY_INTELLIGENCE: "community-intelligence",
  ACTION_COORDINATOR: "action-coordinator",
  IMPACT_MEASUREMENT: "impact-measurement",
  ENGAGEMENT_COACH: "engagement-coach",
  MASTER_COORDINATOR: "master-coordinator",

  
  LLM_CALL: "llm-call",
  EVALUATION: "evaluation",
  EXPERIMENT: "experiment",
  API_CALL: "api-call",

  
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",

  
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  TEST: "test",
} as const;


export function getEnvironmentTag(): string {
  const env = process.env.NODE_ENV || "development";
  return TRACE_TAGS[env.toUpperCase() as keyof typeof TRACE_TAGS] || TRACE_TAGS.DEVELOPMENT;
}


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


export async function shutdownOpik(): Promise<void> {
  console.log("🔄 Shutting down Opik...");
  await flushTraces();
  console.log("✅ Opik shutdown complete");
}


if (typeof process !== "undefined" && typeof window === "undefined") {
  process.on("beforeExit", () => {
    shutdownOpik().catch(console.error);
  });
}