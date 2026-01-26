import { getModel, parseJsonResponse, MODELS } from "@/lib/gemini/config";
import { SYSTEM_PROMPTS } from "../prompts/system-prompts";
import type { CommunityIssue, AgentResponse } from "@/types";
import { traceAgentCall, evaluateAgentResponse } from "@/lib/opik/client";

export class CommunityIntelligenceAgent {
  private model;

  constructor() {
    this.model = getModel("FLASH");
  }

  
  async discoverIssues(
    location: { city: string; state: string },
    userInterests?: string[]
  ): Promise<AgentResponse<CommunityIssue[]>> {
    const input = { location, userInterests };

    return traceAgentCall(
      "community_intelligence_discover",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.COMMUNITY_INTELLIGENCE}

Task: Discover 5-10 real community issues in ${location.city}, ${location.state} that need volunteer support.

${userInterests && userInterests.length > 0 ? `User is particularly interested in: ${userInterests.join(", ")}. Prioritize issues in these areas.` : ""}

For each issue, provide:
- title: Clear, specific title
- description: Detailed description of the problem
- category: One of [environment, homelessness, education, seniors, youth, health, food-security, housing, community-development, arts-culture, animal-welfare, disaster-relief, other]
- urgency: One of [low, medium, high, critical]
- skillsNeeded: Array of specific skills needed
- volunteersNeeded: Estimated number of volunteers
- estimatedHours: Estimated hours per volunteer
- location: {city, state}

Respond in JSON format:
{
  "issues": [
    {
      "title": "...",
      "description": "...",
      "category": "...",
      "urgency": "...",
      "skillsNeeded": [],
      "volunteersNeeded": 0,
      "estimatedHours": 0,
      "location": { "city": "...", "state": "..." }
    }
  ],
  "reasoning": "Brief explanation of how you identified these issues"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const parsed = parseJsonResponse<{
          issues: any[];
          reasoning: string;
        }>(text);

        if (!parsed || !parsed.issues) {
          return {
            success: false,
            error: "Failed to parse response",
          };
        }

        
        const issues: CommunityIssue[] = parsed.issues.map((issue) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          location: issue.location,
          urgency: issue.urgency,
          skillsNeeded: issue.skillsNeeded || [],
          volunteersNeeded: issue.volunteersNeeded || 5,
          volunteersJoined: 0,
          estimatedHours: issue.estimatedHours || 10,
          status: "active",
          createdBy: "ai",
          createdAt: new Date().toISOString(),
          aiGenerated: true,
          source: "community_intelligence_agent",
        }));

        
        await evaluateAgentResponse(
          "community_intelligence",
          input,
          { issues: parsed.issues, reasoning: parsed.reasoning },
          MODELS.FLASH
        );

        return {
          success: true,
          data: issues,
          reasoning: parsed.reasoning,
          confidence: 0.85,
        };
      },
      { location: `${location.city}, ${location.state}` }
    );
  }

  
  async analyzeIssue(issue: CommunityIssue): Promise<AgentResponse<any>> {
    const input = { issue };

    return traceAgentCall(
      "community_intelligence_analyze",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.COMMUNITY_INTELLIGENCE}

Task: Analyze this community issue and provide insights:

Issue: ${issue.title}
Description: ${issue.description}
Location: ${issue.location.city}, ${issue.location.state}
Category: ${issue.category}

Provide:
1. Root causes of this issue
2. Potential challenges volunteers might face
3. Success factors for addressing this issue
4. Similar successful initiatives (if any)
5. Recommended approach for volunteers

Respond in JSON format:
{
  "rootCauses": [],
  "challenges": [],
  "successFactors": [],
  "similarInitiatives": [],
  "recommendedApproach": "...",
  "additionalResources": []
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const analysis = parseJsonResponse(text);

        if (!analysis) {
          return {
            success: false,
            error: "Failed to parse analysis",
          };
        }

        return {
          success: true,
          data: analysis,
          confidence: 0.8,
        };
      }
    );
  }

  
  async validateIssue(issue: Partial<CommunityIssue>): Promise<AgentResponse<{
    valid: boolean;
    concerns: string[];
    suggestions: string[];
  }>> {
    const input = { issue };

    return traceAgentCall(
      "community_intelligence_validate",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.COMMUNITY_INTELLIGENCE}

Task: Validate this user-submitted community issue for safety and appropriateness:

Title: ${issue.title}
Description: ${issue.description}
Category: ${issue.category}

Check for:
1. Is this appropriate for volunteer involvement? (not requiring licensed professionals for dangerous tasks)
2. Is this specific and actionable? (not too vague or abstract)
3. Are there any safety concerns?
4. Is this respectful and non-discriminatory?
5. Does this seem legitimate? (not spam, scam, or political campaigning)

Respond in JSON format:
{
  "valid": true/false,
  "concerns": ["list of any concerns"],
  "suggestions": ["suggestions for improvement"]
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const validation = parseJsonResponse<{
          valid: boolean;
          concerns: string[];
          suggestions: string[];
        }>(text);

        if (!validation) {
          return {
            success: false,
            error: "Failed to validate issue",
          };
        }

        
        await evaluateAgentResponse(
          "community_intelligence_validate",
          input,
          validation,
          MODELS.FLASH
        );

        return {
          success: true,
          data: validation,
          confidence: 0.9,
        };
      }
    );
  }
}

export const communityIntelligenceAgent = new CommunityIntelligenceAgent();