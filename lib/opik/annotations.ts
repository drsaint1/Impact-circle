import { getOpikClient } from "./config";

export interface AnnotationQueueItem {
  agentName: string;
  input: any;
  output: any;
  metadata?: Record<string, any>;
  priority?: "low" | "medium" | "high";
}


export async function queueForReview(
  queueName: string,
  item: AnnotationQueueItem
): Promise<void> {
  const opikClient = getOpikClient();

  if (!opikClient) {
    console.log(`⚠️ Opik not configured, skipping annotation queue`);
    return;
  }

  try {
    
    const trace = opikClient.trace({
      name: `${item.agentName}_for_review`,
      input: item.input,
      output: item.output,
      metadata: {
        ...item.metadata,
        annotationQueue: queueName,
        priority: item.priority || "medium",
        needsReview: true,
      },
      tags: ["needs_review", queueName, item.agentName],
    });

    trace.end();

    await opikClient.flush();

    console.log(`📝 Queued ${item.agentName} output for review in "${queueName}"`);
  } catch (error) {
    console.error(`Failed to queue for review:`, error);
  }
}


export const ANNOTATION_QUEUES = {
  
  SKILL_MATCHING: "skill_matching_review",

  
  IMPACT_VALIDATION: "impact_validation_review",

  
  SAFETY_FLAGS: "safety_review",

  
  LOW_CONFIDENCE: "low_confidence_review",

  
  USER_FEEDBACK: "user_feedback_review",
} as const;


export async function autoQueueForReview(
  agentName: string,
  input: any,
  output: any,
  confidence?: number
): Promise<void> {
  
  if (confidence !== undefined && confidence < 0.7) {
    await queueForReview(ANNOTATION_QUEUES.LOW_CONFIDENCE, {
      agentName,
      input,
      output,
      priority: "high",
      metadata: { confidence },
    });
  }

  
  if (output.flags && output.flags.length > 0) {
    await queueForReview(ANNOTATION_QUEUES.SAFETY_FLAGS, {
      agentName,
      input,
      output,
      priority: "high",
      metadata: { flags: output.flags },
    });
  }

  
  if (agentName === "impact_measurement_validate" && !output.valid) {
    await queueForReview(ANNOTATION_QUEUES.IMPACT_VALIDATION, {
      agentName,
      input,
      output,
      priority: "medium",
      metadata: { validationResult: "rejected" },
    });
  }
}