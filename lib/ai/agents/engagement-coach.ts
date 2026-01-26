import { getModel, parseJsonResponse, MODELS } from "@/lib/gemini/config";
import { SYSTEM_PROMPTS } from "../prompts/system-prompts";
import type { User, EngagementCheckIn, AgentResponse } from "@/types";
import { traceAgentCall, evaluateAgentResponse } from "@/lib/opik/client";

export class EngagementCoachAgent {
  private model;

  constructor() {
    this.model = getModel("FLASH");
  }

  
  async generateCheckIn(
    user: User,
    context: {
      daysSinceLastActivity?: number;
      recentActivities?: number;
      totalHoursThisMonth?: number;
    }
  ): Promise<AgentResponse<EngagementCheckIn>> {
    const input = {
      userId: user.id,
      context,
    };

    return traceAgentCall(
      "engagement_coach_checkin",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ENGAGEMENT_COACH}

Task: Create a personalized check-in for this volunteer.

User: ${user.fullName}
Context:
- Days since last activity: ${context.daysSinceLastActivity || 0}
- Recent activities: ${context.recentActivities || 0}
- Hours this month: ${context.totalHoursThisMonth || 0}
- Interests: ${user.interests.join(", ")}

Create a check-in that:
1. Feels personal and genuine
2. Asks about their wellbeing
3. Acknowledges their contributions
4. Offers support or suggestions
5. Isn't pushy or guilt-tripping

Respond in JSON format:
{
  "question": "Main check-in question",
  "responses": ["option 1", "option 2", "option 3", "Other"],
  "motivation": "Encouraging message",
  "suggestions": ["actionable suggestion 1", "suggestion 2"]
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const checkIn = parseJsonResponse<{
          question: string;
          responses: string[];
          motivation: string;
          suggestions: string[];
        }>(text);

        if (!checkIn) {
          return {
            success: false,
            error: "Failed to generate check-in",
          };
        }

        const engagement: EngagementCheckIn = {
          userId: user.id,
          question: checkIn.question,
          responses: checkIn.responses,
          motivation: checkIn.motivation,
          suggestions: checkIn.suggestions,
          timestamp: new Date().toISOString(),
        };

        
        await evaluateAgentResponse(
          "engagement_coach_checkin",
          input,
          checkIn,
          MODELS.FLASH
        );

        return {
          success: true,
          data: engagement,
          confidence: 0.89,
        };
      }
    );
  }

  
  async detectBurnout(
    user: User,
    activityPattern: {
      weeklyHours: number[];
      missedCommitments: number;
      engagementScore: number;
    }
  ): Promise<AgentResponse<{
    riskLevel: "low" | "medium" | "high";
    indicators: string[];
    recommendations: string[];
    supportMessage: string;
  }>> {
    const input = {
      userId: user.id,
      pattern: activityPattern,
    };

    return traceAgentCall(
      "engagement_coach_burnout",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ENGAGEMENT_COACH}

Task: Assess this volunteer's burnout risk and provide support.

User: ${user.fullName}
Weekly Hours (last 4 weeks): ${activityPattern.weeklyHours.join(", ")}
Missed Commitments: ${activityPattern.missedCommitments}
Engagement Score: ${activityPattern.engagementScore}/100

Analyze:
1. Is there a concerning pattern? (overwork, declining engagement, inconsistency)
2. What are specific indicators of burnout risk?
3. What support or adjustments would help?
4. How to communicate this sensitively?

Respond in JSON format:
{
  "riskLevel": "low|medium|high",
  "indicators": ["specific signs you noticed"],
  "recommendations": ["actionable suggestions"],
  "supportMessage": "Caring, non-judgmental message to send"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const assessment = parseJsonResponse<{
          riskLevel: "low" | "medium" | "high";
          indicators: string[];
          recommendations: string[];
          supportMessage: string;
        }>(text);

        if (!assessment) {
          return {
            success: false,
            error: "Failed to assess burnout risk",
          };
        }

        
        await evaluateAgentResponse(
          "engagement_coach_burnout",
          input,
          assessment,
          MODELS.FLASH
        );

        return {
          success: true,
          data: assessment,
          confidence: 0.84,
          metadata: {
            riskLevel: assessment.riskLevel,
          },
        };
      }
    );
  }

  
  async provideMotivation(
    user: User,
    situation: "starting" | "struggling" | "celebrating" | "returning",
    context?: string
  ): Promise<AgentResponse<{
    message: string;
    actionableTip: string;
    inspiration: string;
  }>> {
    const input = {
      userId: user.id,
      situation,
    };

    return traceAgentCall(
      "engagement_coach_motivate",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ENGAGEMENT_COACH}

Task: Provide personalized motivation for this volunteer.

User: ${user.fullName}
Interests: ${user.interests.join(", ")}
Situation: ${situation}
${context ? `Context: ${context}` : ""}

Tailor your message to the situation:
- starting: Welcome and encouragement for new journey
- struggling: Support and perspective during challenges
- celebrating: Recognition and reinforcement of success
- returning: Welcome back after a break

Be authentic, specific, and actionable. Avoid generic platitudes.

Respond in JSON format:
{
  "message": "Main motivational message",
  "actionableTip": "One concrete next step",
  "inspiration": "Inspiring thought or quote"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const motivation = parseJsonResponse<{
          message: string;
          actionableTip: string;
          inspiration: string;
        }>(text);

        if (!motivation) {
          return {
            success: false,
            error: "Failed to generate motivation",
          };
        }

        return {
          success: true,
          data: motivation,
          confidence: 0.87,
        };
      }
    );
  }

  
  async suggestPacing(
    user: User,
    currentCommitments: {
      activeCircles: number;
      weeklyHours: number;
      upcomingActivities: number;
    }
  ): Promise<AgentResponse<{
    assessment: string;
    recommendedHours: number;
    adjustments: string[];
    rationale: string;
  }>> {
    const input = {
      userId: user.id,
      commitments: currentCommitments,
      availability: user.availability.hoursPerWeek,
    };

    return traceAgentCall(
      "engagement_coach_pacing",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ENGAGEMENT_COACH}

Task: Assess if this volunteer's pace is sustainable and suggest adjustments.

User: ${user.fullName}
Stated Availability: ${user.availability.hoursPerWeek} hours/week

Current Commitments:
- Active Circles: ${currentCommitments.activeCircles}
- Current Weekly Hours: ${currentCommitments.weeklyHours}
- Upcoming Activities: ${currentCommitments.upcomingActivities}

Evaluate:
1. Is this pace sustainable long-term?
2. Are they over/under-committed?
3. What adjustments would create better balance?
4. How to communicate this supportively?

Respond in JSON format:
{
  "assessment": "Overall assessment of current pace",
  "recommendedHours": 0-20,
  "adjustments": ["specific suggestions"],
  "rationale": "Why these recommendations"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const pacing = parseJsonResponse<{
          assessment: string;
          recommendedHours: number;
          adjustments: string[];
          rationale: string;
        }>(text);

        if (!pacing) {
          return {
            success: false,
            error: "Failed to suggest pacing",
          };
        }

        return {
          success: true,
          data: pacing,
          confidence: 0.86,
        };
      }
    );
  }

  
  async celebrateMilestone(
    user: User,
    milestone: {
      type: "hours" | "activities" | "impact" | "streak";
      value: number;
      description: string;
    }
  ): Promise<AgentResponse<{
    message: string;
    badge?: {
      name: string;
      description: string;
      icon: string;
    };
    shareableText: string;
  }>> {
    const input = {
      userId: user.id,
      milestone,
    };

    return traceAgentCall(
      "engagement_coach_celebrate",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ENGAGEMENT_COACH}

Task: Celebrate this volunteer's milestone achievement!

User: ${user.fullName}
Milestone: ${milestone.description}
Type: ${milestone.type}
Value: ${milestone.value}

Create:
1. Enthusiastic celebration message
2. Optional badge/achievement (if it's a major milestone)
3. Shareable text they can post (if appropriate)

Be genuinely excited and specific about their achievement.

Respond in JSON format:
{
  "message": "Celebration message",
  "badge": {
    "name": "Badge name",
    "description": "What this represents",
    "icon": "emoji or icon name"
  },
  "shareableText": "Text they can share with others"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const celebration = parseJsonResponse<{
          message: string;
          badge?: any;
          shareableText: string;
        }>(text);

        if (!celebration) {
          return {
            success: false,
            error: "Failed to generate celebration",
          };
        }

        return {
          success: true,
          data: celebration,
          confidence: 0.9,
        };
      }
    );
  }
}

export const engagementCoachAgent = new EngagementCoachAgent();