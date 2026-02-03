import { evaluateAgent, type EvaluationResults } from "./evaluations";
import type { EvaluationMetric } from "./metrics";
import { getDefaultMetrics } from "./metrics";


export interface ExperimentVariant {
  name: string;
  agentFunction: (input: any) => Promise<any>;
  config?: Record<string, any>;
  description?: string;
}


export interface ExperimentConfig {
  name: string;
  description: string;
  datasetName: string;
  variants: ExperimentVariant[];
  metrics?: EvaluationMetric[];
  maxCases?: number;
}


export interface ExperimentResults {
  experimentName: string;
  datasetName: string;
  variants: Record<string, EvaluationResults>;
  winner: {
    name: string;
    overallScore: number;
    improvements: Record<string, number>;
  };
  comparison: {
    metricComparison: Record<
      string,
      Array<{ variant: string; score: number }>
    >;
    bestPerMetric: Record<string, string>;
  };
  timestamp: string;
}


export async function runExperiment(
  config: ExperimentConfig
): Promise<ExperimentResults> {
  const { name, description, datasetName, variants, maxCases } = config;

  
  const metrics =
    config.metrics ||
    (variants[0] ? getDefaultMetrics(variants[0].name) : []);

  console.log(`\n🧪 Running Experiment: ${name}`);
  console.log(`   Description: ${description}`);
  console.log(`   Dataset: ${datasetName}`);
  console.log(`   Variants: ${variants.map((v) => v.name).join(", ")}`);
  console.log(`   Metrics: ${metrics.map((m) => m.name || "custom").join(", ")}`);
  console.log("");

  const variantResults: Record<string, EvaluationResults> = {};

  
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const variantNum = i + 1;

    console.log(
      `📊 Evaluating variant ${variantNum}/${variants.length}: ${variant.name}`
    );
    if (variant.description) {
      console.log(`   ${variant.description}`);
    }

    const results = await evaluateAgent({
      agentName: variant.name,
      agentFunction: variant.agentFunction,
      datasetName,
      metrics,
      experimentName: name,
      maxCases,
      verbose: false,
    });

    variantResults[variant.name] = results;

    
    const avgScore =
      Object.values(results.averageScores).reduce((a, b) => a + b, 0) /
      Object.values(results.averageScores).length;
    console.log(
      `   Overall Score: ${(avgScore * 100).toFixed(1)}% (${results.successfulCases}/${results.totalCases} succeeded)`
    );
    console.log("");
  }

  
  const analysis = analyzeExperiment(variantResults);

  
  printExperimentComparison(variantResults, analysis);

  const experimentResults: ExperimentResults = {
    experimentName: name,
    datasetName,
    variants: variantResults,
    winner: analysis.winner,
    comparison: analysis.comparison,
    timestamp: new Date().toISOString(),
  };

  return experimentResults;
}


function analyzeExperiment(variantResults: Record<string, EvaluationResults>): {
  winner: {
    name: string;
    overallScore: number;
    improvements: Record<string, number>;
  };
  comparison: {
    metricComparison: Record<string, Array<{ variant: string; score: number }>>;
    bestPerMetric: Record<string, string>;
  };
} {
  const variantNames = Object.keys(variantResults);
  const metricNames = Object.keys(variantResults[variantNames[0]].averageScores);

  
  const overallScores: Record<string, number> = {};
  for (const variantName of variantNames) {
    const avgScore =
      Object.values(variantResults[variantName].averageScores).reduce(
        (a, b) => a + b,
        0
      ) / metricNames.length;
    overallScores[variantName] = avgScore;
  }

  
  let winnerName = variantNames[0];
  let winnerScore = overallScores[winnerName];

  for (const variantName of variantNames) {
    if (overallScores[variantName] > winnerScore) {
      winnerName = variantName;
      winnerScore = overallScores[variantName];
    }
  }

  
  const baselineName = variantNames[0];
  const improvements: Record<string, number> = {};

  for (const metricName of metricNames) {
    const baselineScore =
      variantResults[baselineName].averageScores[metricName];
    const winnerMetricScore =
      variantResults[winnerName].averageScores[metricName];
    improvements[metricName] = winnerMetricScore - baselineScore;
  }

  
  const metricComparison: Record<
    string,
    Array<{ variant: string; score: number }>
  > = {};
  const bestPerMetric: Record<string, string> = {};

  for (const metricName of metricNames) {
    metricComparison[metricName] = variantNames.map((variantName) => ({
      variant: variantName,
      score: variantResults[variantName].averageScores[metricName],
    }));

    
    metricComparison[metricName].sort((a, b) => b.score - a.score);
    bestPerMetric[metricName] = metricComparison[metricName][0].variant;
  }

  return {
    winner: {
      name: winnerName,
      overallScore: winnerScore,
      improvements,
    },
    comparison: {
      metricComparison,
      bestPerMetric,
    },
  };
}


function printExperimentComparison(
  variantResults: Record<string, EvaluationResults>,
  analysis: {
    winner: {
      name: string;
      overallScore: number;
      improvements: Record<string, number>;
    };
    comparison: {
      metricComparison: Record<
        string,
        Array<{ variant: string; score: number }>
      >;
      bestPerMetric: Record<string, string>;
    };
  }
): void {
  const variantNames = Object.keys(variantResults);
  const metricNames = Object.keys(variantResults[variantNames[0]].averageScores);

  console.log("📈 Experiment Results");
  console.log("=".repeat(80));
  console.log("");

  
  console.log("Metric Performance:");
  console.log("-".repeat(80));

  for (const metricName of metricNames) {
    console.log(`\n${metricName}:`);

    const sorted = analysis.comparison.metricComparison[metricName];
    for (let i = 0; i < sorted.length; i++) {
      const { variant, score } = sorted[i];
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
      const scorePercent = (score * 100).toFixed(1);

      console.log(`  ${medal} ${variant.padEnd(20)} ${scorePercent}%`);
    }
  }

  console.log("\n" + "-".repeat(80));
  console.log("\n🏆 Winner: " + analysis.winner.name.toUpperCase());
  console.log(
    `   Overall Score: ${(analysis.winner.overallScore * 100).toFixed(1)}%`
  );
  console.log("\n   Improvements vs Baseline:");

  for (const [metricName, improvement] of Object.entries(
    analysis.winner.improvements
  )) {
    const sign = improvement >= 0 ? "+" : "";
    const symbol = improvement > 0 ? "📈" : improvement < 0 ? "📉" : "➡️";
    const color = improvement > 0 ? "\x1b[32m" : improvement < 0 ? "\x1b[31m" : "";
    const reset = "\x1b[0m";

    console.log(
      `      ${symbol} ${metricName.padEnd(20)} ${color}${sign}${(improvement * 100).toFixed(2)}%${reset}`
    );
  }

  console.log("\n" + "=".repeat(80));
  console.log("");
}


export async function quickCompare(params: {
  datasetName: string;
  baseline: (input: any) => Promise<any>;
  candidate: (input: any) => Promise<any>;
  baselineName?: string;
  candidateName?: string;
  metrics?: EvaluationMetric[];
}): Promise<ExperimentResults> {
  return await runExperiment({
    name: `quick_comparison_${Date.now()}`,
    description: "Quick A/B comparison",
    datasetName: params.datasetName,
    variants: [
      {
        name: params.baselineName || "baseline",
        agentFunction: params.baseline,
      },
      {
        name: params.candidateName || "candidate",
        agentFunction: params.candidate,
      },
    ],
    metrics: params.metrics,
  });
}



function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}



export function assignExperimentVariant(
  experimentName: string,
  userId: string
): "control" | "variant_a" {
  
  const weights = { control: 50, variant_a: 50 };

  const hash = simpleHash(`${experimentName}:${userId}`);
  const total = weights.control + weights.variant_a;
  const normalized = hash % total;

  return normalized < weights.control ? "control" : "variant_a";
}



export async function trackExperimentFeedback(
  experimentName: string,
  variant: string,
  userId: string,
  feedback: Record<string, any>
): Promise<void> {
  const { getOpikClient } = await import("./config");
  const opikClient = getOpikClient();

  if (!opikClient) {
    console.warn("Opik not configured, skipping experiment feedback tracking");
    return;
  }

  try {
    const trace = opikClient.trace({
      name: `experiment_${experimentName}`,
      input: { userId, variant },
      output: feedback,
      metadata: {
        experimentName,
        variant,
        userId,
        timestamp: new Date().toISOString(),
      },
      tags: ["experiment", experimentName, variant],
    });

    trace.end();
    await opikClient.flush();

    console.log(`📊 Tracked experiment feedback for ${experimentName}:${variant}`);
  } catch (error) {
    console.error("Failed to track experiment feedback:", error);
  }
}
