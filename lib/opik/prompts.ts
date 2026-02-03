import { getOpikClient } from "./config";


export const PROMPT_KEYS = {
  COMMUNITY_INTELLIGENCE: "community-intelligence-v1",
  SKILL_MATCHER: "skill-matcher-v1",
  ACTION_COORDINATOR: "action-coordinator-v1",
  IMPACT_MEASUREMENT: "impact-measurement-v1",
  ENGAGEMENT_COACH: "engagement-coach-v1",
  MASTER_COORDINATOR: "master-coordinator-v1",
} as const;


export async function getPrompt(
  promptKey: string,
  variables?: Record<string, any>
): Promise<string> {
  const opikClient = getOpikClient();

  if (!opikClient) {
    console.log(`⚠️ Opik not configured, using local prompt for ${promptKey}`);
    return getFallbackPrompt(promptKey);
  }

  try {
    
    const prompt = await opikClient.getPrompt({
      name: promptKey,
    });

    
    if (!prompt || !prompt.template) {
      console.warn(`Prompt ${promptKey} has no template, using fallback`);
      return getFallbackPrompt(promptKey);
    }

    
    if (variables) {
      return formatPromptTemplate(prompt.template, variables);
    }

    return prompt.template;
  } catch (error) {
    console.warn(`Failed to fetch prompt ${promptKey} from Opik:`, error);
    return getFallbackPrompt(promptKey);
  }
}


export async function createPrompt(
  promptKey: string,
  template: string,
  metadata?: {
    description?: string;
    tags?: string[];
    version?: string;
  }
): Promise<void> {
  const opikClient = getOpikClient();

  if (!opikClient) {
    console.warn("⚠️ Opik not configured, cannot create prompt");
    return;
  }

  try {
    
    await opikClient.createPrompt({
      name: promptKey,
      prompt: template, 
      metadata: metadata || {},
    });

    console.log(`✅ Created/Updated prompt: ${promptKey}`);
  } catch (error) {
    console.error(`Failed to create prompt ${promptKey}:`, error);
  }
}


function formatPromptTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let formatted = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    formatted = formatted.replace(regex, String(value));
  }

  return formatted;
}


function getFallbackPrompt(promptKey: string): string {
  
  const { SYSTEM_PROMPTS } = require("@/lib/ai/prompts/system-prompts");

  const mapping: Record<string, string> = {
    [PROMPT_KEYS.COMMUNITY_INTELLIGENCE]: SYSTEM_PROMPTS.COMMUNITY_INTELLIGENCE,
    [PROMPT_KEYS.SKILL_MATCHER]: SYSTEM_PROMPTS.SKILL_MATCHER,
    [PROMPT_KEYS.ACTION_COORDINATOR]: SYSTEM_PROMPTS.ACTION_COORDINATOR,
    [PROMPT_KEYS.IMPACT_MEASUREMENT]: SYSTEM_PROMPTS.IMPACT_MEASUREMENT,
    [PROMPT_KEYS.ENGAGEMENT_COACH]: SYSTEM_PROMPTS.ENGAGEMENT_COACH,
    [PROMPT_KEYS.MASTER_COORDINATOR]: SYSTEM_PROMPTS.MASTER_COORDINATOR,
  };

  return mapping[promptKey] || "You are a helpful AI assistant.";
}