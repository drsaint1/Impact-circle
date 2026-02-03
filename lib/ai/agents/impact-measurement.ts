import { getModel, parseJsonResponse, MODELS } from "@/lib/gemini/config";
import { SYSTEM_PROMPTS } from "../prompts/system-prompts";
import type { Activity, ImpactMetrics, AgentResponse } from "@/types";
import { traceAgentCall, evaluateAgentResponse } from "@/lib/opik/client";

export class ImpactMeasurementAgent {
  private model;

  constructor() {
    this.model = getModel("FLASH");
  }

  /**
   * Define impact metrics for an activity
   */
  async defineMetrics(
    activityTitle: string,
    activityDescription: string,
    category: string
  ): Promise<AgentResponse<{
    metrics: Array<{
      name: string;
      description: string;
      unit: string;
      targetValue?: number;
    }>;
    trackingMethod: string;
  }>> {
    const input = { activityTitle, category };

    return traceAgentCall(
      "impact_measurement_define",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.IMPACT_MEASUREMENT}

Task: Define measurable impact metrics for this community activity.

Activity: ${activityTitle}
Description: ${activityDescription}
Category: ${category}

Define 2-4 specific, measurable metrics that can track the impact of this activity.

For each metric:
- name: Short, clear name
- description: What this measures and why it matters
- unit: What unit to measure in (people, hours, pounds, meals, etc.)
- targetValue: Realistic target (optional)

Also suggest how volunteers should track these metrics.

Respond in JSON format:
{
  "metrics": [
    {
      "name": "...",
      "description": "...",
      "unit": "...",
      "targetValue": 100
    }
  ],
  "trackingMethod": "How to track these metrics"
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const metricsData = parseJsonResponse<{
          metrics: any[];
          trackingMethod: string;
        }>(text);

        if (!metricsData) {
          return {
            success: false,
            error: "Failed to define metrics",
          };
        }

        return {
          success: true,
          data: metricsData,
          confidence: 0.87,
        };
      }
    );
  }

  /**
   * Validate impact claims with optional image evidence
   */
  async validateImpact(
    activity: Activity,
    reportedMetrics: Record<string, number>,
    evidenceImages?: string[] // Base64 encoded images
  ): Promise<AgentResponse<{
    valid: boolean;
    confidence: number;
    flags: string[];
    feedback: string;
    imageAnalysis?: string;
  }>> {
    const input = {
      activityId: activity.id,
      activityType: activity.type,
      metrics: reportedMetrics,
      hasImages: evidenceImages && evidenceImages.length > 0,
    };

    return traceAgentCall(
      "impact_measurement_validate",
      input,
      async () => {
        const basePrompt = `${SYSTEM_PROMPTS.IMPACT_MEASUREMENT}

Task: Validate the reported impact metrics for realism and accuracy.

Activity: ${activity.title}
Description: ${activity.description}
Type: ${activity.type}
Duration: ${activity.completedDate && activity.scheduledDate
  ? `${Math.round((new Date(activity.completedDate).getTime() - new Date(activity.scheduledDate).getTime()) / (1000 * 60 * 60))} hours`
  : "Unknown"}

Reported Impact:
${Object.entries(reportedMetrics).map(([key, value]) => `- ${key}: ${value}`).join("\n")}`;

        let validation;

        // If images are provided, use vision model for enhanced validation
        if (evidenceImages && evidenceImages.length > 0) {
          const visionPrompt = `${basePrompt}

Evidence Images: ${evidenceImages.length} image(s) provided

Analyze the provided images AND the reported metrics:
1. Do the images show evidence of the claimed impact?
2. Do the images match the activity description?
3. Are the reported numbers consistent with what you see in the images?
4. Do you see any red flags or inconsistencies between images and claims?
5. What specific details from the images support or contradict the metrics?

Respond in JSON format:
{
  "valid": true/false,
  "confidence": 0.0-1.0,
  "flags": ["list of concerns if any"],
  "feedback": "Explanation of your assessment",
  "imageAnalysis": "What you observed in the images and how it relates to the claims"
}`;

          // Prepare content with images for Gemini vision
          const imageParts = evidenceImages.map((base64Image) => ({
            inlineData: {
              data: base64Image.split(',')[1] || base64Image, // Remove data:image/... prefix if present
              mimeType: "image/jpeg", // Gemini supports jpeg, png, webp
            },
          }));

          const result = await this.model.generateContent([
            visionPrompt,
            ...imageParts,
          ]);

          const text = result.response.text();
          validation = parseJsonResponse<{
            valid: boolean;
            confidence: number;
            flags: string[];
            feedback: string;
            imageAnalysis?: string;
          }>(text);
        } else {
          // No images - use text-only validation
          const textPrompt = `${basePrompt}

Evaluate (without image evidence):
1. Are these numbers realistic for this type of activity?
2. Do the metrics make sense together?
3. Are there any red flags (too high, suspiciously round numbers, impossible claims)?
4. Is anything missing or suspicious?

Note: No image evidence was provided, so validation is based only on reported numbers.

Respond in JSON format:
{
  "valid": true/false,
  "confidence": 0.0-1.0,
  "flags": ["list of concerns if any"],
  "feedback": "Explanation of your assessment"
}`;

          const result = await this.model.generateContent(textPrompt);
          const text = result.response.text();
          validation = parseJsonResponse<{
            valid: boolean;
            confidence: number;
            flags: string[];
            feedback: string;
          }>(text);
        }

        if (!validation) {
          return {
            success: false,
            error: "Failed to validate impact",
          };
        }

        // Evaluate validation quality
        await evaluateAgentResponse(
          "impact_measurement_validate",
          input,
          validation,
          MODELS.FLASH
        );

        return {
          success: true,
          data: validation,
          confidence: evidenceImages && evidenceImages.length > 0 ? 0.95 : 0.85,
          metadata: {
            flagCount: validation.flags.length,
            hasImageEvidence: evidenceImages && evidenceImages.length > 0,
          },
        };
      }
    );
  }

  /**
   * Generate an impact report
   */
  async generateReport(
    circleName: string,
    activities: Activity[],
    overallMetrics: ImpactMetrics
  ): Promise<AgentResponse<{
    summary: string;
    highlights: string[];
    insights: string[];
    recommendations: string[];
  }>> {
    const input = {
      circleName,
      activityCount: activities.length,
      totalHours: overallMetrics.hoursContributed,
    };

    return traceAgentCall(
      "impact_measurement_report",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.IMPACT_MEASUREMENT}

Task: Generate an inspiring impact report for this action circle.

Circle: ${circleName}
Total Activities: ${activities.length}

Activity Details:
${activities.map((a, idx) => `
${idx + 1}. ${a.title} (${a.status})
   - ${a.description}
   - ${a.impact ? Object.entries(a.impact.metrics).map(([k, v]) => `${k}: ${v}`).join(", ") : "No impact data"}
`).join("\n")}

Overall Metrics:
- Volunteers: ${overallMetrics.volunteersEngaged}
- Hours Contributed: ${overallMetrics.hoursContributed}
- People Helped: ${overallMetrics.peopleHelped}
- Custom Metrics: ${JSON.stringify(overallMetrics.customMetrics)}

Create an impact report with:
1. Executive summary (2-3 sentences)
2. Key highlights (3-5 specific achievements)
3. Insights (patterns, learnings, success factors)
4. Recommendations for future work

Be specific, inspiring, and data-driven.

Respond in JSON format:
{
  "summary": "...",
  "highlights": [],
  "insights": [],
  "recommendations": []
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const report = parseJsonResponse<{
          summary: string;
          highlights: string[];
          insights: string[];
          recommendations: string[];
        }>(text);

        if (!report) {
          return {
            success: false,
            error: "Failed to generate report",
          };
        }

        return {
          success: true,
          data: report,
          confidence: 0.85,
        };
      }
    );
  }

  /**
   * Suggest next impact goals
   */
  async suggestNextGoals(
    currentMetrics: ImpactMetrics,
    category: string
  ): Promise<AgentResponse<{
    goals: Array<{
      metric: string;
      currentValue: number;
      targetValue: number;
      reasoning: string;
      achievableBy: string;
    }>;
  }>> {
    const input = {
      category,
      currentImpact: currentMetrics.peopleHelped,
    };

    return traceAgentCall(
      "impact_measurement_goals",
      input,
      async () => {
        const prompt = `${SYSTEM_PROMPTS.IMPACT_MEASUREMENT}

Task: Suggest realistic next impact goals based on current progress.

Current Metrics:
- Volunteers: ${currentMetrics.volunteersEngaged}
- Hours: ${currentMetrics.hoursContributed}
- People Helped: ${currentMetrics.peopleHelped}
- Other: ${JSON.stringify(currentMetrics.customMetrics)}

Category: ${category}

Suggest 3-4 SMART goals that:
1. Build on current momentum
2. Are achievable within 1-3 months
3. Increase impact meaningfully
4. Keep volunteers motivated

Respond in JSON format:
{
  "goals": [
    {
      "metric": "...",
      "currentValue": 0,
      "targetValue": 0,
      "reasoning": "...",
      "achievableBy": "timeframe"
    }
  ]
}`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const goals = parseJsonResponse<{ goals: any[] }>(text);

        if (!goals) {
          return {
            success: false,
            error: "Failed to suggest goals",
          };
        }

        return {
          success: true,
          data: goals,
          confidence: 0.83,
        };
      }
    );
  }
}

export const impactMeasurementAgent = new ImpactMeasurementAgent();