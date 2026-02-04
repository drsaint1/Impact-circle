import { getOpikClient } from "./config";


export interface FeedbackScore {
  name: string;
  value: number; 
  reason?: string;
  category?: "quality" | "relevance" | "helpfulness" | "accuracy" | "satisfaction" | "custom";
}


export interface FeedbackResult {
  success: boolean;
  traceId: string;
  scoresLogged: number;
  error?: string;
}


export async function logFeedback(params: {
  traceId: string;
  scores: FeedbackScore[];
  comment?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<FeedbackResult> {
  const opikClient = getOpikClient();

  if (!opikClient) {
    console.warn("Opik not configured, skipping feedback logging");
    return {
      success: false,
      traceId: params.traceId,
      scoresLogged: 0,
      error: "Opik not configured",
    };
  }

  try {

    for (const score of params.scores) {
      // @ts-expect-error - Opik SDK method exists at runtime
      await opikClient.logFeedbackScore({
        traceId: params.traceId,
        name: score.name,
        value: score.value,
        reason: score.reason || params.comment,
        categoryName: score.category || "custom",
      });
    }

    console.log(
      `✅ Logged ${params.scores.length} feedback score(s) for trace ${params.traceId}`
    );

    return {
      success: true,
      traceId: params.traceId,
      scoresLogged: params.scores.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to log feedback:", errorMessage);

    return {
      success: false,
      traceId: params.traceId,
      scoresLogged: 0,
      error: errorMessage,
    };
  }
}


export async function logThumbsFeedback(params: {
  traceId: string;
  thumbsUp: boolean;
  comment?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<FeedbackResult> {
  return await logFeedback({
    traceId: params.traceId,
    scores: [
      {
        name: "user_satisfaction",
        value: params.thumbsUp ? 1.0 : 0.0,
        reason: params.comment,
        category: "satisfaction",
      },
    ],
    userId: params.userId,
    metadata: params.metadata,
  });
}


export async function logStarRating(params: {
  traceId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<FeedbackResult> {
  return await logFeedback({
    traceId: params.traceId,
    scores: [
      {
        name: "star_rating",
        value: (params.stars - 1) / 4, 
        reason: params.comment,
        category: "quality",
      },
    ],
    userId: params.userId,
    metadata: {
      ...params.metadata,
      stars: params.stars,
    },
  });
}


export async function logMultiDimensionalFeedback(params: {
  traceId: string;
  ratings: Record<string, 1 | 2 | 3 | 4 | 5>;
  comment?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<FeedbackResult> {
  const scores: FeedbackScore[] = Object.entries(params.ratings).map(
    ([name, stars]) => ({
      name,
      value: (stars - 1) / 4,
      reason: params.comment,
      category: "quality" as const,
    })
  );

  return await logFeedback({
    traceId: params.traceId,
    scores,
    userId: params.userId,
    metadata: params.metadata,
  });
}


export async function logNegativeFeedback(params: {
  traceId: string;
  issues: string[];
  comment?: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<FeedbackResult> {
  return await logFeedback({
    traceId: params.traceId,
    scores: [
      {
        name: "user_satisfaction",
        value: 0.0,
        reason: `Issues: ${params.issues.join(", ")}. ${params.comment || ""}`,
        category: "satisfaction",
      },
    ],
    userId: params.userId,
    metadata: {
      ...params.metadata,
      issues: params.issues,
    },
  });
}


export async function logExpertAnnotation(params: {
  traceId: string;
  expertId: string;
  scores: Record<string, number>;
  notes?: string;
  approved?: boolean;
  metadata?: Record<string, any>;
}): Promise<FeedbackResult> {
  const scores: FeedbackScore[] = Object.entries(params.scores).map(
    ([name, value]) => ({
      name: `expert_${name}`,
      value,
      reason: params.notes,
      category: "quality" as const,
    })
  );

  
  if (params.approved !== undefined) {
    scores.push({
      name: "expert_approval",
      value: params.approved ? 1.0 : 0.0,
      reason: params.notes,
      category: "quality",
    });
  }

  return await logFeedback({
    traceId: params.traceId,
    scores,
    metadata: {
      ...params.metadata,
      expertId: params.expertId,
      reviewType: "expert_annotation",
      timestamp: new Date().toISOString(),
    },
  });
}


export async function getFeedbackStats(params: {
  agentName: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}): Promise<{
  totalFeedback: number;
  averageSatisfaction: number;
  thumbsUpPercentage: number;
  averageStarRating: number;
  commonIssues: Array<{ issue: string; count: number }>;
} | null> {
  console.warn(`getFeedbackStats for ${params.agentName} not yet implemented`);
  console.warn("This requires Opik REST API integration");

  
  return null;
}