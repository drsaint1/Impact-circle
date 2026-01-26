import {
  
  createDataset,
  addDatasetItems,
  getDataset,
  createSkillMatcherSampleDataset,

  
  evaluateAgent,
  quickEvaluate,
  compareAgents,

  
  relevanceMetric,
  accuracyMetric,
  hallucinationMetric,
  personalizationMetric,
  actionabilityMetric,

  
  runExperiment,
  quickCompare,

  
  logThumbsFeedback,
  logStarRating,
  logMultiDimensionalFeedback,

  
  setBudget,
  trackCost,
  getBudgetStatus,
  setupDefaultBudgets,
  getAllBudgets,

  
  traceAgentCallWithSpans,
  SpanContext,
} from "@/lib/opik";



async function example1_Datasets() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 1: Datasets - Create Test Cases for Evaluation");
  console.log("=".repeat(80) + "\n");

  
  await createSkillMatcherSampleDataset();

  
  const datasetId = await createDataset({
    name: "my-custom-dataset",
    description: "Custom test cases for my agent",
    agentName: "skill_matcher",
  });

  
  await addDatasetItems("my-custom-dataset", [
    {
      input: {
        userId: "user-001",
        skills: ["Python", "Machine Learning"],
      },
      expectedOutput: {
        matchCount: 5,
        confidence: 0.8,
      },
      metadata: {
        difficulty: "medium",
        category: "ml_specialist",
      },
    },
  ]);

  console.log("✅ Dataset examples completed\n");
}





async function example2_Evaluations() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 2: Evaluations - Test Agent Quality");
  console.log("=".repeat(.80) + "\n");

  
  const mockSkillMatcher = async (input: any) => {
    return {
      matches: [{ id: 1, score: 0.9 }, { id: 2, score: 0.85 }],
      confidence: 0.87,
    };
  };

  
  const results = await evaluateAgent({
    agentName: "skill_matcher",
    agentFunction: mockSkillMatcher,
    datasetName: "skill-matcher-sample",
    metrics: [relevanceMetric, accuracyMetric, personalizationMetric],
    maxCases: 2, 
  });

  console.log("\nEvaluation Results:");
  console.log(`  Total Cases: ${results.totalCases}`);
  console.log(`  Success Rate: ${(results.successfulCases / results.totalCases * 100).toFixed(1)}%`);
  console.log(`  Average Scores:`, results.averageScores);

  console.log("\n✅ Evaluation examples completed\n");
}





async function example3_Experiments() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 3: Experiments - A/B Test Different Versions");
  console.log("=".repeat(80) + "\n");

  
  const baselineAgent = async (input: any) => ({
    matches: [{ id: 1, score: 0.8 }],
    confidence: 0.75,
  });

  const improvedAgent = async (input: any) => ({
    matches: [{ id: 1, score: 0.9 }, { id: 2, score: 0.85 }],
    confidence: 0.87,
  });

  
  const experimentResults = await quickCompare({
    datasetName: "skill-matcher-sample",
    baseline: baselineAgent,
    candidate: improvedAgent,
    baselineName: "baseline_v1",
    candidateName: "improved_v2",
    metrics: [relevanceMetric, accuracyMetric],
  });

  console.log(`\n🏆 Winner: ${experimentResults.winner.name}`);
  console.log(`   Overall Score: ${(experimentResults.winner.overallScore * 100).toFixed(1)}%`);

  console.log("\n✅ Experiment examples completed\n");
}





async function example4_Feedback() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 4: Feedback - Collect User Ratings");
  console.log("=".repeat(80) + "\n");

  const mockTraceId = "trace-" + Math.random().toString(36).substr(2, 9);

  
  await logThumbsFeedback({
    traceId: mockTraceId,
    thumbsUp: true,
    comment: "Great matches!",
    userId: "user-123",
  });

  
  await logStarRating({
    traceId: mockTraceId,
    stars: 5,
    comment: "Excellent recommendations",
    userId: "user-123",
  });

  
  await logMultiDimensionalFeedback({
    traceId: mockTraceId,
    ratings: {
      relevance: 5,
      accuracy: 4,
      helpfulness: 5,
    },
    comment: "Very helpful overall",
    userId: "user-123",
  });

  console.log("✅ Feedback examples completed\n");
}





async function example5_BudgetTracking() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 5: Budget Tracking - Monitor Costs");
  console.log("=".repeat(80) + "\n");

  
  setBudget({
    agentName: "skill_matcher",
    dailyLimit: 5.0, 
    monthlyLimit: 100.0, 
    alertThreshold: 0.8, 
  });

  
  const cost1 = trackCost("skill_matcher", "gemini-2.0-flash-exp", 1000, 500);
  console.log(`Cost tracked: $${cost1.cost.toFixed(6)}`);

  const cost2 = trackCost("skill_matcher", "gemini-1.5-pro", 2000, 1000);
  console.log(`Cost tracked: $${cost2.cost.toFixed(6)}`);

  
  const status = getBudgetStatus("skill_matcher");
  if (status) {
    console.log("\nBudget Status:");
    console.log(`  Daily: $${status.dailySpend.toFixed(4)} / $${status.dailyLimit}`);
    console.log(`  Monthly: $${status.monthlySpend.toFixed(4)} / $${status.monthlyLimit}`);
    console.log(`  Daily Usage: ${(status.dailyPercentage * 100).toFixed(1)}%`);
  }

  
  setupDefaultBudgets();

  console.log("\n✅ Budget tracking examples completed\n");
}





async function example6_Spans() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 6: Spans - Track Sub-Operations");
  console.log("=".repeat(80) + "\n");

  const result = await traceAgentCallWithSpans(
    "skill_matcher_with_spans",
    { userId: "user-123" },
    async ({ createSpan }) => {
      
      const fetchUserSpan = createSpan("fetch_user");
      await new Promise(resolve => setTimeout(resolve, 100)); 
      const user = { id: "user-123", skills: ["JavaScript", "React"] };
      fetchUserSpan.end({ userId: user.id, skillsCount: user.skills.length });

      
      const fetchOppsSpan = createSpan("fetch_opportunities");
      await new Promise(resolve => setTimeout(resolve, 150)); 
      const opportunities = [{ id: 1 }, { id: 2 }, { id: 3 }];
      fetchOppsSpan.end({ count: opportunities.length });

      
      const llmSpan = createSpan("llm_matching");
      await new Promise(resolve => setTimeout(resolve, 200)); 
      const matches = [{ id: 1, score: 0.9 }, { id: 2, score: 0.85 }];
      llmSpan.end({ matchCount: matches.length });

      return { matches, user, opportunities };
    }
  );

  console.log("\nResult:", result);
  console.log("\n✅ Spans examples completed\n");
}





async function example7_SpanContext() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 7: SpanContext - Automatic Span Management");
  console.log("=".repeat(80) + "\n");

  await traceAgentCallWithSpans(
    "skill_matcher_clean",
    { userId: "user-456" },
    async (helpers) => {
      const ctx = new SpanContext(helpers);

      
      const user = await ctx.withSpan("fetch_user", async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: "user-456", skills: ["Python", "ML"] };
      });

      const opportunities = await ctx.withSpan("fetch_opportunities", async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return [{ id: 1 }, { id: 2 }];
      });

      const matches = await ctx.withSpan("match", async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return [{ id: 1, score: 0.95 }];
      });

      return { user, opportunities, matches };
    }
  );

  console.log("\n✅ SpanContext examples completed\n");
}





async function runAllExamples() {
  console.log("\n");
  console.log("╔" + "=".repeat(78) + "╗");
  console.log("║" + " ".repeat(15) + "OPIK ADVANCED FEATURES - EXAMPLES" + " ".repeat(30) + "║");
  console.log("╚" + "=".repeat(78) + "╝");

  try {
    await example1_Datasets();
    await example2_Evaluations();
    await example3_Experiments();
    await example4_Feedback();
    await example5_BudgetTracking();
    await example6_Spans();
    await example7_SpanContext();

    console.log("\n" + "=".repeat(80));
    console.log("✅ ALL EXAMPLES COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ Example failed:", error);
    process.exit(1);
  }
}


if (require.main === module) {
  runAllExamples();
}

export { runAllExamples };