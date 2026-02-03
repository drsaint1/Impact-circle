import { GoogleGenerativeAI } from "@google/generative-ai";
import { createTrackedModel } from "@/lib/opik/gemini-wrapper";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}

// Initialize Gemini AI
export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Model configurations for different use cases
export const MODELS = {
  // Using Gemini 2.0 Flash (fast, stable, cost-effective)
  FLASH: "gemini-2.0-flash",
  // Balanced model for most tasks (better reasoning)
  PRO: "gemini-2.5-pro",
  // For evaluation and critical tasks
  EVAL: "gemini-2.5-pro",
} as const;

// Safety settings
export const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

// Generation config for consistent output
export const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048,
};

// Get model instance (with optional Opik tracing)
export function getModel(
  modelName: keyof typeof MODELS = "FLASH",
  useTracking: boolean = true,
) {
  const modelId = MODELS[modelName];

  if (useTracking) {
    // Return tracked model with automatic Opik integration
    return createTrackedModel(modelId, {
      modelType: modelName,
      safetySettings: "enabled",
      generationConfig: "standard",
    });
  }

  // Return standard model without tracking
  return genAI.getGenerativeModel({
    model: modelId,
    safetySettings,
    generationConfig,
  });
}

// Get tracked model (explicit version)
export function getTrackedModel(modelName: keyof typeof MODELS = "FLASH") {
  return createTrackedModel(MODELS[modelName], {
    modelType: modelName,
    safetySettings: "enabled",
    generationConfig: "standard",
  });
}

// Helper to parse JSON responses safely
export function parseJsonResponse<T>(text: string): T | null {
  try {
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    return null;
  }
}
