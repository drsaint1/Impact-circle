export type EvaluationMetric<T = any> = (params: {
  input: any;
  output: any;
  expectedOutput?: any;
  context?: any;
}) => Promise<{
  name: string;
  value: number; // 0-1 scale (higher is better)
  reason?: string;
  metadata?: Record<string, any>;
}>;


export const relevanceMetric: EvaluationMetric = async ({ input, output }) => {
  try {
    const { getModel } = await import("@/lib/gemini/config");
    const model = getModel("EVAL", false);

    const prompt = `Evaluate the relevance of this AI agent response.

Input: ${JSON.stringify(input, null, 2)}
Output: ${JSON.stringify(output, null, 2)}

Score the relevance from 0-100:
- 0: Completely irrelevant
- 50: Somewhat relevant
- 100: Perfectly relevant and on-topic

Respond with JSON:
{
  "score": <number>,
  "reason": "<brief explanation>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      name: "relevance",
      value: parsed.score / 100,
      reason: parsed.reason,
    };
  } catch (error) {
    console.error("Relevance metric failed:", error);
    return {
      name: "relevance",
      value: 0.5,
      reason: `Evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};


export const accuracyMetric: EvaluationMetric = async ({ output, expectedOutput }) => {
  if (!expectedOutput) {
    return {
      name: "accuracy",
      value: 0,
      reason: "No expected output provided",
    };
  }

  try {
    
    const outputStr = JSON.stringify(output);
    const expectedStr = JSON.stringify(expectedOutput);

    
    const similarity = stringSimilarity(outputStr, expectedStr);

    return {
      name: "accuracy",
      value: similarity,
      reason: `Output similarity: ${(similarity * 100).toFixed(1)}%`,
      metadata: {
        outputLength: outputStr.length,
        expectedLength: expectedStr.length,
      },
    };
  } catch (error) {
    return {
      name: "accuracy",
      value: 0,
      reason: "Comparison failed",
    };
  }
};


export const hallucinationMetric: EvaluationMetric = async ({ input, output, context }) => {
  try {
    const { getModel } = await import("@/lib/gemini/config");
    const model = getModel("EVAL", false);

    const prompt = `Detect hallucinations in this AI response.

Context/Input: ${JSON.stringify({ input, context }, null, 2)}
AI Output: ${JSON.stringify(output, null, 2)}

Score hallucination from 0-100:
- 0: Fully factual, grounded in context
- 50: Some unverified claims
- 100: Completely hallucinated, false information

Respond with JSON:
{
  "score": <number>,
  "reason": "<explanation>",
  "examples": ["<hallucination 1>", "<hallucination 2>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      name: "hallucination",
      value: 1 - parsed.score / 100, 
      reason: parsed.reason,
      metadata: {
        examples: parsed.examples || [],
      },
    };
  } catch (error) {
    console.error("Hallucination metric failed:", error);
    return {
      name: "hallucination",
      value: 0.5,
      reason: "Evaluation failed",
    };
  }
};


export const personalizationMetric: EvaluationMetric = async ({ input, output }) => {
  try {
    const { getModel } = await import("@/lib/gemini/config");
    const model = getModel("EVAL", false);

    const prompt = `Evaluate how personalized this response is to the user's context.

User Context: ${JSON.stringify(input, null, 2)}
Response: ${JSON.stringify(output, null, 2)}

Score personalization from 0-100:
- 0: Generic, could apply to anyone
- 50: Some personalization, mentions user context
- 100: Highly personalized, deeply tailored to user's specific situation

Respond with JSON:
{
  "score": <number>,
  "reason": "<explanation>",
  "personalizations": ["<element 1>", "<element 2>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.JSON.parse(cleaned);

    return {
      name: "personalization",
      value: parsed.score / 100,
      reason: parsed.reason,
      metadata: {
        personalizations: parsed.personalizations || [],
      },
    };
  } catch (error) {
    return {
      name: "personalization",
      value: 0.5,
      reason: "Evaluation failed",
    };
  }
};


export const actionabilityMetric: EvaluationMetric = async ({ output }) => {
  try {
    const { getModel } = await import("@/lib/gemini/config");
    const model = getModel("EVAL", false);

    const prompt = `Evaluate how actionable this agent response is.

Response: ${JSON.stringify(output, null, 2)}

Score actionability from 0-100:
- 0: Vague, no clear actions
- 50: Some actions, but not specific
- 100: Clear, specific, immediately actionable steps

Respond with JSON:
{
  "score": <number>,
  "reason": "<explanation>",
  "actions_found": <number>
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      name: "actionability",
      value: parsed.score / 100,
      reason: parsed.reason,
      metadata: {
        actionsFound: parsed.actions_found,
      },
    };
  } catch (error) {
    return {
      name: "actionability",
      value: 0.5,
      reason: "Evaluation failed",
    };
  }
};


export const responseTimeMetric: EvaluationMetric = async ({ output }) => {
  const duration = output?.metadata?.duration_ms || output?.duration_ms || 0;

  
  
  let score = 1.0;
  if (duration > 5000) score = 0.2;
  else if (duration > 3000) score = 0.5;
  else if (duration > 1000) score = 0.8;

  return {
    name: "response_time",
    value: score,
    reason: `Response time: ${duration}ms`,
    metadata: {
      durationMs: duration,
    },
  };
};


export const confidenceCalibrationMetric: EvaluationMetric = async ({
  output,
  expectedOutput,
}) => {
  const confidence = output?.confidence || 0.5;
  const hasExpected = expectedOutput !== undefined;

  if (!hasExpected) {
    return {
      name: "confidence_calibration",
      value: 0.5,
      reason: "No expected output to compare",
    };
  }

  
  const isCorrect =
    (output?.matches?.length > 0 && expectedOutput?.matches?.length > 0) ||
    (output?.recommendations?.length > 0 && expectedOutput?.recommendations?.length > 0);

  
  const calibrationScore = isCorrect ? confidence : 1 - confidence;

  return {
    name: "confidence_calibration",
    value: calibrationScore,
    reason: `Confidence: ${confidence.toFixed(2)}, Correct: ${isCorrect}`,
    metadata: {
      confidence,
      isCorrect,
    },
  };
};



function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDist = editDistance(longer, shorter);
  return (longer.length - editDist) / longer.length;
}

function editDistance(s1: string, s2: string): number {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}


export const ALL_METRICS = {
  relevance: relevanceMetric,
  accuracy: accuracyMetric,
  hallucination: hallucinationMetric,
  personalization: personalizationMetric,
  actionability: actionabilityMetric,
  responseTime: responseTimeMetric,
  confidenceCalibration: confidenceCalibrationMetric,
};


export function getDefaultMetrics(agentType: string): EvaluationMetric[] {
  const metricSets: Record<string, EvaluationMetric[]> = {
    skill_matcher: [relevanceMetric, accuracyMetric, personalizationMetric],
    community_intelligence: [
      relevanceMetric,
      hallucinationMetric,
      actionabilityMetric,
    ],
    engagement_coach: [personalizationMetric, actionabilityMetric, responseTimeMetric],
    impact_measurement: [hallucinationMetric, accuracyMetric],
    action_coordinator: [relevanceMetric, actionabilityMetric],
    master_coordinator: [accuracyMetric, responseTimeMetric],
  };

  return metricSets[agentType] || [relevanceMetric, accuracyMetric];
}