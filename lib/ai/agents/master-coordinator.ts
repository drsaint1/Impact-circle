import { getModel, parseJsonResponse } from "@/lib/gemini/config";
import { SYSTEM_PROMPTS } from "../prompts/system-prompts";
import type { User, AgentResponse } from "@/types";
import { traceAgentCall } from "@/lib/opik/client";

export class MasterCoordinatorAgent {
  private model;

  constructor() {
    this.model = getModel("FLASH");
  }

  /**
   * Coordinate multiple agent recommendations
   */
  async coordinateRecommendations(
    user: User,
    agentOutputs: {
      matcher?: any;
      coordinator?: any;
      coach?: any;
    },
    context: string
  ): Promise<AgentResponse<{
    primaryRecommendation: string;
    secondaryActions: string[];
    reasoning: string;
    priority: "high" | "medium" | "low";
  }>> {
    const input = {
      userId: user.id,
      context,
      agentCount: Object.keys(agentOutputs).length,
    };

    return traceAgentCall(
      "master_coordinator",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.MASTER_COORDINATOR}`

Task: Coordinate recommendations from multiple agents into a coherent action plan.

User: ${user.fullName}
Context: ${context}

Agent Recommendations:
${Object.entries(agentOutputs).map(([agent, output]) => `
${agent}:
${JSON.stringify(output, null, 2)}
`).join("\n")}

Your role:
1. Identify conflicts or contradictions
2. Prioritize based on user wellbeing and impact
3. Create unified recommendation
4. Ensure coherent user experience

Respond in JSON format:
{
  "primaryRecommendation": "Main action user should take",
  "secondaryActions": ["supporting actions"],
  "reasoning": "Why this prioritization",
  "priority": "high|medium|low"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const coordination = parseJsonResponse<{
          primaryRecommendation: string;
          secondaryActions: string[];
          reasoning: string;
          priority: "high" | "medium" | "low";
        }>(text);

        if (!coordination) {
          return {
            success: false,
            error: "Failed to coordinate recommendations",
          };
        }

        return {
          success: true,
          data: coordination,
          confidence: 0.88,
        };
      }
    );
  }

  /**
   * Safety check for any user-generated or AI-generated content
   */
  async safetyCheck(
    content: string,
    contentType: "issue" | "message" | "activity" | "profile"
  ): Promise<AgentResponse<{
    safe: boolean;
    concerns: string[];
    category?: string;
    recommendation: "approve" | "flag" | "block";
  }>> {
    const input = {
      contentType,
      contentLength: content.length,
    };

    return traceAgentCall(
      "master_coordinator_safety",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.MASTER_COORDINATOR}`

Task: Perform a safety check on this content.

Content Type: ${contentType}
Content: ${content}

Check for:
1. Harmful, dangerous, or inappropriate content
2. Spam or scams
3. Personal information (PII) that shouldn't be shared
4. Discriminatory or hateful content
5. Commercial solicitation
6. Political campaigning (this is a community service platform)
7. Misleading or false information

Respond in JSON format:
{
  "safe": true/false,
  "concerns": ["list any issues"],
  "category": "type of concern if unsafe",
  "recommendation": "approve|flag|block"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const safetyResult = parseJsonResponse<{
          safe: boolean;
          concerns: string[];
          category?: string;
          recommendation: "approve" | "flag" | "block";
        }>(text);

        if (!safetyResult) {
          
          return {
            success: true,
            data: {
              safe: false,
              concerns: ["Unable to complete safety check"],
              recommendation: "flag",
            },
            confidence: 0.5,
          };
        }

        return {
          success: true,
          data: safetyResult,
          confidence: 0.93,
          metadata: {
            flagged: !safetyResult.safe,
            recommendation: safetyResult.recommendation,
          },
        };
      }
    );
  }

  /**
   * Handle edge cases or exceptions
   */
  async handleEdgeCase(
    situation: string,
    availableOptions: string[]
  ): Promise<AgentResponse<{
    recommendation: string;
    explanation: string;
    escalate: boolean;
  }>> {
    const input = {
      situation,
      optionCount: availableOptions.length,
    };

    return traceAgentCall(
      "master_coordinator_edge_case",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.MASTER_COORDINATOR}`

Task: Handle an edge case or unusual situation.

Situation: ${situation}

Available Options:
${availableOptions.map((opt, idx) => `${idx + 1}. ${opt}`).join("\n")}

Determine:
1. Best course of action
2. Clear explanation
3. Whether this needs human escalation

Respond in JSON format:
{
  "recommendation": "chosen option or new suggestion",
  "explanation": "reasoning",
  "escalate": true/false
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const decision = parseJsonResponse<{
          recommendation: string;
          explanation: string;
          escalate: boolean;
        }>(text);

        if (!decision) {
          return {
            success: false,
            error: "Failed to handle edge case",
          };
        }

        return {
          success: true,
          data: decision,
          confidence: 0.75,
        };
      }
    );
  }
}

export const masterCoordinatorAgent = new MasterCoordinatorAgent();