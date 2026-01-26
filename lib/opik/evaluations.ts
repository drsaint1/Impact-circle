import { getOpikClient } from "./config";
import { getDataset } from "./datasets";
import type { EvaluationMetric } from "./metrics";
import {
  relevanceMetric,
  accuracyMetric,
  getDefaultMetrics,
} from "./metrics";


export interface EvaluationCaseResult {
  input: any;
  output?: any;
  expectedOutput?: any;
  error?: string;
  metrics: Array<{
    name: string;
    value: number;
    reason?: string;
    metadata?: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}


export interface EvaluationResults {
  agentName: string;
  datasetName: string;
  totalCases: number;
  successfulCases: number;
  failedCases: number;
  averageScores: Record<string, number>;
  results: EvaluationCaseResult[];
  timestamp: string;
}


export interface EvaluationConfig {
  agentName: string;
  agentFunction: (input: any) => Promise<any>;
  datasetName: string;
  metrics?: EvaluationMetric[];
  experimentName?: string;
  maxCases?: number; // Limit number of test cases (for testing)
  verbose?: boolean;
}


export async function evaluateAgent(
  config: EvaluationConfig
): Promise<EvaluationResults> {
  const opikClient = getOpikClient();
  const {
    agentName,
    agentFunction,
    datasetName,
    maxCases,
    verbose = true,
  } = config;

  // Use default metrics if not provided
  const metrics = config.metrics || getDefaultMetrics(agentName);

  if (verbose) {
    console.log(`\n🧪 Evaluating ${agentName} on dataset: ${datasetName}`);
    console.log(`   Metrics: ${metrics.map((m) => m.name).join(", ")}`);
  }

  // Load dataset
  const dataset = await getDataset(datasetName);
  let items = dataset.items || [];

  // Limit cases if specified
  if (maxCases && maxCases < items.length) {
    items = items.slice(0, maxCases);
    if (verbose) {
      console.log(`   Limited to ${maxCases} test cases`);
    }
  }

  if (verbose) {
    console.log(`   Test cases: ${items.length}`);
    console.log("");
  }

  const results: EvaluationCaseResult[] = [];
  const scores: Record<string, number[]> = {};
  let successCount = 0;
  let failCount = 0;

  // Run evaluation on each test case
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const caseNum = i + 1;

    if (verbose) {
      process.stdout.write(`   [${caseNum}/${items.length}] Evaluating... `);
    }

    try {
      // Run agent on test case
      const startTime = Date.now();
      const output = await agentFunction(item.input);
      const duration = Date.now() - startTime;

      // Calculate metrics
      const metricResults = await Promise.all(
        metrics.map((metric) =>
          metric({
            input: item.input,
            output,
            expectedOutput: item.expectedOutput,
            context: item.metadata,
          })
        )
      );

      // Aggregate scores
      for (const metric of metricResults) {
        if (!scores[metric.name]) scores[metric.name] = [];
        scores[metric.name].push(metric.value);
      }

      results.push({
        input: item.input,
        output,
        expectedOutput: item.expectedOutput,
        metrics: metricResults,
        metadata: {
          ...item.metadata,
          duration_ms: duration,
        },
      });

      successCount++;

      if (verbose) {
        const avgScore =
          metricResults.reduce((sum, m) => sum + m.value, 0) / metricResults.length;
        console.log(`✅ Score: ${(avgScore * 100).toFixed(1)}% (${duration}ms)`);
      }
    } catch (error) {
      failCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);

      results.push({
        input: item.input,
        error: errorMessage,
        metrics: [],
        metadata: item.metadata,
      });

      if (verbose) {
        console.log(`❌ Error: ${errorMessage}`);
      }
    }
  }

  // Calculate average scores
  const averageScores: Record<string, number> = {};
  for (const [name, values] of Object.entries(scores)) {
    averageScores[name] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  const evalResults: EvaluationResults = {
    agentName,
    datasetName,
    totalCases: items.length,
    successfulCases: successCount,
    failedCases: failCount,
    averageScores,
    results,
    timestamp: new Date().toISOString(),
  };

  if (verbose) {
    console.log("\n📊 Evaluation Complete");
    console.log(`   Success Rate: ${((successCount / items.length) * 100).toFixed(1)}%`);
    console.log(`   Average Scores:`);
    for (const [name, value] of Object.entries(averageScores)) {
      console.log(`      ${name}: ${(value * 100).toFixed(1)}%`);
    }
    console.log("");
  }

  // Log to Opik if configured
  if (opikClient && config.experimentName) {
    await logEvaluationToOpik(evalResults, config.experimentName);
  }

  return evalResults;
}

/**
 * Log evaluation results to Opik for tracking
 */
async function logEvaluationToOpik(
  results: EvaluationResults,
  experimentName: string
): Promise<void> {
  const opikClient = getOpikClient();
  if (!opikClient) return;

  try {
    const trace = opikClient.trace({
      name: `evaluation_${results.agentName}`,
      input: {
        datasetName: results.datasetName,
        experimentName,
      },
      output: {
        averageScores: results.averageScores,
        successRate: results.successfulCases / results.totalCases,
      },
      metadata: {
        totalCases: results.totalCases,
        successfulCases: results.successfulCases,
        failedCases: results.failedCases,
        timestamp: results.timestamp,
        experimentName,
      },
      tags: ["evaluation", results.agentName, experimentName],
    });

    trace.end();
    await opikClient.flush();

    console.log(`✅ Evaluation logged to Opik (experiment: ${experimentName})`);
  } catch (error) {
    console.error("Failed to log evaluation to Opik:", error);
  }
}

/**
 * Quick evaluation helper - evaluate with default metrics
 *
 * @example
 * ```typescript
 * const results = await quickEvaluate(
 *   "skill_matcher",
 *   skillMatcherFunction,
 *   "skill-matcher-sample"
 * );
 * ```
 */
export async function quickEvaluate(
  agentName: string,
  agentFunction: (input: any) => Promise<any>,
  datasetName: string
): Promise<EvaluationResults> {
  return await evaluateAgent({
    agentName,
    agentFunction,
    datasetName,
    metrics: getDefaultMetrics(agentName),
  });
}

/**
 * Compare two agent versions
 *
 * @example
 * ```typescript
 * const comparison = await compareAgents({
 *   datasetName: "skill-matcher-sample",
 *   baseline: {
 *     name: "current_version",
 *     function: currentMatcherFunction
 *   },
 *   candidate: {
 *     name: "new_version",
 *     function: newMatcherFunction
 *   }
 * });
 * ```
 */
export async function compareAgents(config: {
  datasetName: string;
  baseline: {
    name: string;
    function: (input: any) => Promise<any>;
  };
  candidate: {
    name: string;
    function: (input: any) => Promise<any>;
  };
  metrics?: EvaluationMetric[];
}): Promise<{
  baseline: EvaluationResults;
  candidate: EvaluationResults;
  comparison: {
    metricDifferences: Record<string, number>;
    winner: "baseline" | "candidate" | "tie";
    improvementPercentage: number;
  };
}> {
  const metrics = config.metrics || [relevanceMetric, accuracyMetric];

  console.log("\n🔬 Agent Comparison");
  console.log(`   Dataset: ${config.datasetName}`);
  console.log(`   Baseline: ${config.baseline.name}`);
  console.log(`   Candidate: ${config.candidate.name}`);
  console.log("");

  // Evaluate baseline
  console.log("📊 Evaluating baseline...");
  const baselineResults = await evaluateAgent({
    agentName: config.baseline.name,
    agentFunction: config.baseline.function,
    datasetName: config.datasetName,
    metrics,
    verbose: false,
  });

  // Evaluate candidate
  console.log("📊 Evaluating candidate...");
  const candidateResults = await evaluateAgent({
    agentName: config.candidate.name,
    agentFunction: config.candidate.function,
    datasetName: config.datasetName,
    metrics,
    verbose: false,
  });

  // Compare results
  const metricDifferences: Record<string, number> = {};
  let totalImprovement = 0;
  let metricCount = 0;

  for (const metricName of Object.keys(baselineResults.averageScores)) {
    const baselineScore = baselineResults.averageScores[metricName];
    const candidateScore = candidateResults.averageScores[metricName];
    const difference = candidateScore - baselineScore;

    metricDifferences[metricName] = difference;
    totalImprovement += difference;
    metricCount++;
  }

  const avgImprovement = totalImprovement / metricCount;
  const improvementPercentage = avgImprovement * 100;

  let winner: "baseline" | "candidate" | "tie";
  if (Math.abs(improvementPercentage) < 1) {
    winner = "tie";
  } else if (improvementPercentage > 0) {
    winner = "candidate";
  } else {
    winner = "baseline";
  }

  // Print comparison
  console.log("\n📈 Comparison Results");
  console.log("   Metric                 Baseline  Candidate  Difference");
  console.log("   " + "-".repeat(60));

  for (const [metricName, diff] of Object.entries(metricDifferences)) {
    const baselineScore = baselineResults.averageScores[metricName];
    const candidateScore = candidateResults.averageScores[metricName];
    const diffStr =
      diff >= 0
        ? `+${(diff * 100).toFixed(1)}%`
        : `${(diff * 100).toFixed(1)}%`;
    const symbol = diff > 0 ? "📈" : diff < 0 ? "📉" : "➡️";

    console.log(
      `   ${metricName.padEnd(20)} ${(baselineScore * 100).toFixed(1)}%    ${(candidateScore * 100).toFixed(1)}%     ${symbol} ${diffStr}`
    );
  }

  console.log("");
  console.log(`🏆 Winner: ${winner.toUpperCase()}`);
  console.log(
    `   Overall improvement: ${improvementPercentage >= 0 ? "+" : ""}${improvementPercentage.toFixed(2)}%`
  );
  console.log("");

  return {
    baseline: baselineResults,
    candidate: candidateResults,
    comparison: {
      metricDifferences,
      winner,
      improvementPercentage,
    },
  };
}