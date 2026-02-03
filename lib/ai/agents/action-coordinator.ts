import { getModel, parseJsonResponse, MODELS } from "@/lib/gemini/config";
import { SYSTEM_PROMPTS } from "../prompts/system-prompts";
import type { ActionCircle, User, CommunityIssue, Activity, AgentResponse } from "@/types";
import { traceAgentCall, evaluateAgentResponse } from "@/lib/opik/client";

export class ActionCoordinatorAgent {
  private model;

  constructor() {
    this.model = getModel("FLASH");
  }

  
  async suggestCircleFormation(
    issue: CommunityIssue,
    interestedUsers: User[]
  ): Promise<AgentResponse<{
    recommendedSize: number;
    roleAssignments: Array<{ userId: string; role: string; reasoning: string }>;
    kickoffPlan: string;
    successTips: string[];
  }>> {
    const input = {
      issueId: issue.id,
      userCount: interestedUsers.length,
    };

    return traceAgentCall(
      "action_coordinator_form",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ACTION_COORDINATOR} 

Task: Plan how to form an effective action circle for this community issue.

Issue: ${issue.title}
Description: ${issue.description}
Skills Needed: ${issue.skillsNeeded.join(", ")}
Estimated Effort: ${issue.estimatedHours} hours

Interested Users:
${interestedUsers.map((user, idx) => `
${idx + 1}. ${user.fullName}
   - Skills: ${user.skills.join(", ")}
   - Interests: ${user.interests.join(", ")}
   - Availability: ${user.availability.hoursPerWeek} hrs/week
   - ID: ${user.id}
`).join("\n")}

Provide:
1. Recommended circle size (optimal number of people)
2. Role assignments (who should do what, based on skills and interests)
3. Kickoff plan (how the group should start working together)
4. Success tips specific to this group

Respond in JSON format:
{
  "recommendedSize": 5-10,
  "roleAssignments": [
    {
      "userId": "...",
      "role": "leader|co-leader|member",
      "reasoning": "..."
    }
  ],
  "kickoffPlan": "...",
  "successTips": []
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const plan = parseJsonResponse<{
          recommendedSize: number;
          roleAssignments: any[];
          kickoffPlan: string;
          successTips: string[];
        }>(text);

        if (!plan) {
          return {
            success: false,
            error: "Failed to generate formation plan",
          };
        }

        
        await evaluateAgentResponse(
          "action_coordinator_form",
          input,
          plan,
          MODELS.FLASH
        );

        return {
          success: true,
          data: plan,
          confidence: 0.86,
        };
      }
    );
  }

  
  async generateActionPlan(
    circle: ActionCircle,
    issue: CommunityIssue
  ): Promise<AgentResponse<{
    phases: Array<{
      name: string;
      duration: string;
      activities: Array<{
        title: string;
        description: string;
        type: string;
        assignedRoles: string[];
        estimatedHours: number;
      }>;
    }>;
    milestones: Array<{
      name: string;
      description: string;
      targetDate: string;
    }>;
  }>> {
    const input = {
      circleId: circle.id,
      issueId: issue.id,
    };

    return traceAgentCall(
      "action_coordinator_plan",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ACTION_COORDINATOR} 

Task: Create a detailed action plan for this circle to address their community issue.

Circle: ${circle.name}
Goal: ${circle.goal}
Members: ${circle.members.length} people
Member Roles: ${circle.members.map(m => m.role).join(", ")}

Issue: ${issue.title}
${issue.description}

Create a phased action plan with:
1. 3-4 distinct phases (e.g., Planning, Implementation, Evaluation)
2. Specific activities for each phase
3. Clear milestones to track progress
4. Realistic timelines

Consider:
- Start with relationship-building and planning
- Build momentum with early wins
- Include regular check-ins and reflection
- End with impact measurement and celebration

Respond in JSON format:
{
  "phases": [
    {
      "name": "...",
      "duration": "2 weeks",
      "activities": [
        {
          "title": "...",
          "description": "...",
          "type": "meeting|task|event|milestone",
          "assignedRoles": ["leader", "member"],
          "estimatedHours": 2
        }
      ]
    }
  ],
  "milestones": [
    {
      "name": "...",
      "description": "...",
      "targetDate": "2 weeks from start"
    }
  ]
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const actionPlan = parseJsonResponse<{
          phases: any[];
          milestones: any[];
        }>(text);

        if (!actionPlan) {
          return {
            success: false,
            error: "Failed to generate action plan",
          };
        }

        return {
          success: true,
          data: actionPlan,
          confidence: 0.84,
        };
      }
    );
  }

  
  async facilitateConversation(
    circle: ActionCircle,
    recentMessages: string[],
    context?: string
  ): Promise<AgentResponse<{
    response: string;
    actionItems?: Array<{
      task: string;
      assignTo: string;
      deadline: string;
    }>;
    concerns?: string[];
  }>> {
    const input = {
      circleId: circle.id,
      messageCount: recentMessages.length,
    };

    return traceAgentCall(
      "action_coordinator_facilitate",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ACTION_COORDINATOR} 

Task: Facilitate this circle's conversation as an AI coordinator.

Circle: ${circle.name}
Context: ${context || "Regular check-in"}
Status: ${circle.status}

Recent Conversation:
${recentMessages.join("\n")}

Your role:
1. Respond helpfully to the conversation
2. Identify action items and suggest assignments
3. Flag any concerns or conflicts
4. Keep the team motivated and on track
5. Suggest next steps

Respond in JSON format:
{
  "response": "Your message to the group",
  "actionItems": [
    {
      "task": "...",
      "assignTo": "suggestion or 'anyone'",
      "deadline": "..."
    }
  ],
  "concerns": ["any issues you noticed"]
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const facilitation = parseJsonResponse<{
          response: string;
          actionItems?: any[];
          concerns?: string[];
        }>(text);

        if (!facilitation) {
          return {
            success: false,
            error: "Failed to facilitate conversation",
          };
        }

        
        await evaluateAgentResponse(
          "action_coordinator_facilitate",
          input,
          facilitation,
          MODELS.FLASH
        );

        return {
          success: true,
          data: facilitation,
          confidence: 0.8,
        };
      }
    );
  }

  
  async resolveConflict(
    circle: ActionCircle,
    conflictDescription: string
  ): Promise<AgentResponse<{
    analysis: string;
    suggestedSolutions: string[];
    preventionTips: string[];
  }>> {
    const input = {
      circleId: circle.id,
      conflict: conflictDescription,
    };

    return traceAgentCall(
      "action_coordinator_resolve",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ACTION_COORDINATOR}

Task: Help resolve a conflict or challenge within this action circle.

Circle: ${circle.name}
Members: ${circle.members.length} people
Conflict/Challenge: ${conflictDescription}

Provide:
1. Analysis of the situation
2. 3-4 practical solutions
3. Tips to prevent similar issues

Be empathetic, constructive, and focus on moving forward.

Respond in JSON format:
{
  "analysis": "...",
  "suggestedSolutions": [],
  "preventionTips": []
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const resolution = parseJsonResponse<{
          analysis: string;
          suggestedSolutions: string[];
          preventionTips: string[];
        }>(text);

        if (!resolution) {
          return {
            success: false,
            error: "Failed to generate conflict resolution",
          };
        }

        return {
          success: true,
          data: resolution,
          confidence: 0.78,
        };
      }
    );
  }

  /**
   * Plan activities for a circle working on an issue
   * This is a simplified interface for the plan-activities API route
   */
  async planActions(params: {
    issueId: string;
    issueTitle: string;
    issueDescription: string;
    circleSize: number;
    timeframe: string;
  }): Promise<AgentResponse<{
    phases: Array<{
      name: string;
      duration: string;
      activities: Array<{
        title: string;
        description: string;
        type: string;
        assignedRoles: string[];
        estimatedHours: number;
      }>;
    }>;
    milestones: Array<{
      name: string;
      description: string;
      targetDate: string;
    }>;
  }>> {
    const input = {
      issueId: params.issueId,
      circleSize: params.circleSize,
      timeframe: params.timeframe,
    };

    return traceAgentCall(
      "action_coordinator_plan_activities",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.ACTION_COORDINATOR}

Task: Create a detailed action plan for a circle to address this community issue.

Issue: ${params.issueTitle}
Description: ${params.issueDescription}
Circle Size: ${params.circleSize} members
Timeframe: ${params.timeframe}

Create a phased action plan with:
1. 3-4 distinct phases (e.g., Planning, Implementation, Evaluation)
2. Specific activities for each phase
3. Clear milestones to track progress
4. Realistic timelines based on ${params.timeframe}

Consider:
- Start with relationship-building and planning
- Build momentum with early wins
- Include regular check-ins and reflection
- End with impact measurement and celebration

Respond in JSON format:
{
  "phases": [
    {
      "name": "Phase 1: Planning & Preparation",
      "duration": "2 weeks",
      "activities": [
        {
          "title": "Kickoff Meeting",
          "description": "Get to know team members, align on goals and timeline",
          "type": "meeting",
          "assignedRoles": ["leader", "all members"],
          "estimatedHours": 2
        }
      ]
    }
  ],
  "milestones": [
    {
      "name": "Team Formation Complete",
      "description": "All members onboarded and roles assigned",
      "targetDate": "Week 1"
    }
  ]
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const actionPlan = parseJsonResponse<{
          phases: any[];
          milestones: any[];
        }>(text);

        if (!actionPlan) {
          return {
            success: false,
            error: "Failed to generate action plan",
          };
        }

        return {
          success: true,
          data: actionPlan,
          confidence: 0.85,
        };
      }
    );
  }
}

export const actionCoordinatorAgent = new ActionCoordinatorAgent();
