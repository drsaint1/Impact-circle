import { getModel, parseJsonResponse, MODELS } from "@/lib/gemini/config";
import { SYSTEM_PROMPTS } from "../prompts/system-prompts";
import type {
  User,
  CommunityIssue,
  MatchRecommendation,
  AgentResponse,
} from "@/types";
import { traceAgentCall, evaluateAgentResponse } from "@/lib/opik/client";

export class SkillMatcherAgent {
  private model;

  constructor() {
    this.model = getModel("FLASH");
  }

  async matchUserToIssues(
    user: User,
    availableIssues: CommunityIssue[],
    limit: number = 5,
  ): Promise<AgentResponse<MatchRecommendation[]>> {
    const input = {
      userId: user.id,
      skills: user.skills,
      interests: user.interests,
      availability: user.availability,
      location: user.location,
      issueCount: availableIssues.length,
    };

    return traceAgentCall(
      "skill_matcher_match",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.SKILL_MATCHER}

Task: Match this user to the best community opportunities from the available issues.

User Profile:
- Name: ${user.fullName}
- Location: ${user.location?.city || "N/A"}, ${user.location?.state || "N/A"}
- Skills: ${user.skills?.join(", ") || "No skills listed"}
- Interests: ${user.interests?.join(", ") || "No interests listed"}
- Availability: ${user.availability?.hoursPerWeek || "N/A"} hours/week on ${
          user.availability?.preferredDays?.join(", ") || "Flexible"
        }

Available Issues:
${availableIssues
  .map(
    (issue, idx) => `
${idx + 1}. ${issue.title}
   - Category: ${issue.category}
   - Description: ${issue.description}
   - Skills Needed: ${
     issue.skillsNeeded?.join(", ") || "No specific skills required"
   }
   - Time Commitment: ~${issue.estimatedHours || "TBD"} hours
   - Urgency: ${issue.urgency}
   - ID: ${issue.id}
`,
  )
  .join("\n")}

IMPORTANT: You MUST return at least ${Math.min(limit, availableIssues.length)} matches, even if they aren't perfect fits. Consider:

1. **Skill alignment**: Look for BOTH exact matches AND transferable skills
   - Example: "social media" can transfer to "communication" or "marketing"
   - Example: "project management" helps with ANY organized activity
   - Example: "empathy" and "patience" are valuable for MOST volunteer work

2. **Interest alignment**: Broad interpretation allowed
   - "education" interest → teaching, tutoring, mentoring opportunities
   - "environment" → gardening, cleanup, sustainability
   - "community-development" → almost ANY local issue

3. **Time commitment vs availability**: Flexible matching
4. **Location proximity**: Same city/state is good
5. **Urgency and impact potential**
6. **Personal growth opportunities**

**Scoring Guidelines**:
- 80-100: Excellent fit with direct skill/interest match
- 60-79: Good fit with transferable skills or related interests
- 40-59: Moderate fit where user can contribute meaningfully
- 20-39: Basic fit where any willing volunteer helps
- Below 20: Only if truly no connection at all

For each match, provide:
- issueId: The issue ID
- matchScore: 0-100 score (be generous, most should be 40+)
- reasoning: Why this is a good match for THIS specific user
- strengths: What unique value the user brings (find something positive!)
- considerations: Any potential challenges (optional, can be empty)

**You MUST return ${Math.min(limit, availableIssues.length)} matches.** Be creative in finding connections between user skills/interests and available opportunities.

Respond in JSON format:
{
  "matches": [
    {
      "issueId": "...",
      "matchScore": 0-100,
      "reasoning": "...",
      "strengths": ["..."],
      "considerations": ["..."]
    }
  ]
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const parsed = parseJsonResponse<{
          matches: any[];
        }>(text);

        if (!parsed || !parsed.matches) {
          return {
            success: false,
            error: "Failed to parse matches",
          };
        }

        const recommendations: MatchRecommendation[] = parsed.matches
          .map((match) => {
            const issue = availableIssues.find((i) => i.id === match.issueId);
            if (!issue) return null;

            return {
              issueId: match.issueId,
              issue,
              matchScore: match.matchScore,
              reasoning: match.reasoning,
              strengths: match.strengths || [],
              considerations: match.considerations || [],
            };
          })
          .filter((m): m is MatchRecommendation => m !== null);

        await evaluateAgentResponse(
          "skill_matcher",
          input,
          { matches: parsed.matches },
          MODELS.FLASH,
        );

        return {
          success: true,
          data: recommendations,
          confidence: 0.88,
          metadata: {
            totalIssuesConsidered: availableIssues.length,
            topMatchScore: recommendations[0]?.matchScore || 0,
          },
        };
      },
      { userId: user.id },
    );
  }

  async explainMatch(
    user: User,
    issue: CommunityIssue,
  ): Promise<
    AgentResponse<{
      fitScore: number;
      explanation: string;
      skillGaps: string[];
      growthOpportunities: string[];
    }>
  > {
    const input = {
      userId: user.id,
      issueId: issue.id,
    };

    return traceAgentCall("skill_matcher_explain", input, async () => {
      const prompt = `${SYSTEM_PROMPTS.SKILL_MATCHER}

Task: Provide a detailed explanation of how well this user fits this opportunity.

User:
- Skills: ${user.skills.join(", ")}
- Interests: ${user.interests.join(", ")}
- Availability: ${user.availability.hoursPerWeek} hours/week

Opportunity:
- ${issue.title}
- ${issue.description}
- Skills Needed: ${issue.skillsNeeded.join(", ")}
- Time Needed: ${issue.estimatedHours} hours

Provide:
1. Overall fit score (0-100)
2. Detailed explanation of the fit
3. Any skill gaps the user might have
4. Growth opportunities this presents

Respond in JSON format:
{
  "fitScore": 0-100,
  "explanation": "...",
  "skillGaps": [],
  "growthOpportunities": []
}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const explanation = parseJsonResponse<{
        fitScore: number;
        explanation: string;
        skillGaps: string[];
        growthOpportunities: string[];
      }>(text);

      if (!explanation) {
        return {
          success: false,
          error: "Failed to generate explanation",
        };
      }

      return {
        success: true,
        data: explanation,
        confidence: 0.85,
      };
    });
  }

  async suggestSkillDevelopment(
    user: User,
    desiredImpactAreas: string[],
  ): Promise<
    AgentResponse<{
      recommendations: Array<{
        skill: string;
        why: string;
        howToLearn: string;
        impactPotential: string;
      }>;
    }>
  > {
    const input = {
      userId: user.id,
      currentSkills: user.skills,
      desiredAreas: desiredImpactAreas,
    };

    return traceAgentCall("skill_matcher_develop", input, async () => {
      const prompt = `${SYSTEM_PROMPTS.SKILL_MATCHER}

Task: Suggest skills this user should develop to increase their community impact.

Current Skills: ${user.skills.join(", ")}
Interests: ${user.interests.join(", ")}
Desired Impact Areas: ${desiredImpactAreas.join(", ")}

Suggest 3-5 skills that would:
1. Build on their existing strengths
2. Open new volunteer opportunities
3. Create more impact in their areas of interest
4. Be learnable within 1-3 months

For each skill:
- skill: Name of the skill
- why: Why this skill is valuable for community impact
- howToLearn: Practical ways to learn it (free/low-cost)
- impactPotential: What new opportunities this opens

Respond in JSON format:
{
  "recommendations": [
    {
      "skill": "...",
      "why": "...",
      "howToLearn": "...",
      "impactPotential": "..."
    }
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const suggestions = parseJsonResponse<{
        recommendations: any[];
      }>(text);

      if (!suggestions) {
        return {
          success: false,
          error: "Failed to generate skill suggestions",
        };
      }

      return {
        success: true,
        data: suggestions,
        confidence: 0.82,
      };
    });
  }
}

export const skillMatcherAgent = new SkillMatcherAgent();
