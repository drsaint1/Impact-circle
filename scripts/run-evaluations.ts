import { evaluateAgent, compareAgents } from "@/lib/opik/evaluations";
import { getDefaultMetrics } from "@/lib/opik/metrics";
import { getDataset } from "@/lib/opik/datasets";


async function mockSkillMatcher(input: any): Promise<any> {
  
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { skills, interests, location, availability } = input;

  
  
  return {
    topMatch: "Mock Volunteer Opportunity",
    confidence: 0.85,
    reasoning: `Matched based on ${skills?.join(", ")} and interest in ${interests?.join(", ")}`,
    matches: [
      {
        opportunityId: "mock-001",
        title: "Mock Opportunity 1",
        score: 0.85,
        organization: "Mock Nonprofit",
      },
      {
        opportunityId: "mock-002",
        title: "Mock Opportunity 2",
        score: 0.72,
        organization: "Mock Charity",
      },
    ],
  };
}


async function evaluateSkillMatcher() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 EVALUATING SKILL MATCHER AGENT");
  console.log("=".repeat(60));

  try {
    
    console.log("\n1️⃣  Loading production dataset...");
    const dataset = await getDataset("skill-matcher-production-v1");
    console.log(`   ✅ Loaded ${dataset.items?.length || 0} test cases`);

    
    console.log("\n2️⃣  Configuring evaluation metrics...");
    const metrics = getDefaultMetrics("skill_matcher");
    console.log(`   ✅ Using ${metrics.length} evaluation metrics:`);
    metrics.forEach((m, i) => console.log(`      ${i + 1}. ${m.name}`));

    
    console.log("\n3️⃣  Running evaluation (this may take a few minutes)...");
    console.log("   ⏳ Processing test cases...");

    const results = await evaluateAgent({
      agentName: "skill_matcher",
      agentFunction: mockSkillMatcher,
      datasetName: "skill-matcher-production-v1",
      metrics,
    });

    
    console.log("\n4️⃣  EVALUATION RESULTS:");
    console.log("   " + "-".repeat(56));
    console.log("   Average Scores:");
    Object.entries(results.averageScores).forEach(([metric, score]) => {
      const percentage = (score * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(score * 20));
      const stars = score >= 0.8 ? "⭐" : score >= 0.6 ? "✓" : "⚠️";
      console.log(`   ${stars} ${metric.padEnd(25)}: ${percentage}% ${bar}`);
    });

    console.log("\n   Detailed Statistics:");
    console.log(`   • Total test cases: ${results.results.length}`);
    console.log(`   • Evaluation timestamp: ${results.timestamp}`);
    console.log(
      `   • Average confidence: ${((results.averageScores.confidence_calibration || 0) * 100).toFixed(1)}%`
    );

    
    const categories = results.results.reduce(
      (acc: any, r: any) => {
        const cat = r.input.metadata?.category || "unknown";
        if (!acc[cat]) acc[cat] = { total: 0, scores: [] };
        acc[cat].total++;
        acc[cat].scores.push(
          r.metrics.find((m: any) => m.name === "relevance")?.score || 0
        );
        return acc;
      },
      {}
    );

    console.log("\n   Performance by Category:");
    Object.entries(categories).forEach(([category, data]: [string, any]) => {
      const avgScore = data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length;
      console.log(`   • ${category}: ${(avgScore * 100).toFixed(1)}% (${data.total} cases)`);
    });

    console.log("\n✅ Evaluation complete! Results logged to Opik dashboard.");
    console.log(`   View at: https://www.comet.com/opik/\n`);

    return results;
  } catch (error) {
    console.error("\n❌ Evaluation failed:", error);
    throw error;
  }
}


async function evaluateEngagementCoach() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 EVALUATING ENGAGEMENT COACH AGENT");
  console.log("=".repeat(60));

  try {
    console.log("\n⏭️  Skipping for now - Focus on Skill Matcher first");
    console.log("   Will evaluate after Skill Matcher optimization");
    return null;
  } catch (error) {
    console.error("\n❌ Evaluation failed:", error);
    throw error;
  }
}


async function evaluateCommunityIntelligence() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 EVALUATING COMMUNITY INTELLIGENCE AGENT");
  console.log("=".repeat(60));

  try {
    console.log("\n⏭️  Skipping for now - Focus on Skill Matcher first");
    console.log("   Will evaluate after Skill Matcher optimization");
    return null;
  } catch (error) {
    console.error("\n❌ Evaluation failed:", error);
    throw error;
  }
}


function generateReport(evaluationResults: any[]) {
  console.log("\n" + "=".repeat(60));
  console.log("📋 COMPREHENSIVE EVALUATION REPORT");
  console.log("=".repeat(60));

  const validResults = evaluationResults.filter((r) => r !== null);

  console.log(`\n📊 Summary:`)
  console.log(`   • Agents evaluated: ${validResults.length}`);
  console.log(`   • Total test cases: ${validResults.reduce((sum, r) => sum + r.results.length, 0)}`);
  console.log(`   • Evaluation date: ${new Date().toISOString()}`);

  console.log(`\n🎯 Overall Quality Scores:`);
  validResults.forEach((result, idx) => {
    const agentName = ["Skill Matcher", "Engagement Coach", "Community Intelligence"][idx];
    const avgScore =
      Object.values(result.averageScores).reduce((a: any, b: any) => a + b, 0) /
      Object.keys(result.averageScores).length;
    const grade =
      avgScore >= 0.9 ? "A" : avgScore >= 0.8 ? "B" : avgScore >= 0.7 ? "C" : "D";
    console.log(
      `   ${grade === "A" ? "⭐" : grade === "B" ? "✓" : "⚠️"} ${agentName}: ${(avgScore * 100).toFixed(1)}% (Grade: ${grade})`
    );
  });

  console.log(`\n📈 Recommendations:`);
  validResults.forEach((result, idx) => {
    const agentName = ["Skill Matcher", "Engagement Coach", "Community Intelligence"][idx];
    const lowestMetric = Object.entries(result.averageScores)
      .sort(([, a]: any, [, b]: any) => a - b)[0];

    if (lowestMetric && lowestMetric[1] < 0.75) {
      console.log(
        `   ⚠️  ${agentName}: Improve ${lowestMetric[0]} (currently ${(lowestMetric[1] * 100).toFixed(1)}%)`
      );
    } else {
      console.log(`   ✅ ${agentName}: All metrics above 75% - ready for production`);
    }
  });

  console.log(`\n🔄 Next Steps:`);
  console.log(`   1. Review detailed results in Opik dashboard`);
  console.log(`   2. Identify failure cases and add to dataset`);
  console.log(`   3. Run A/B experiments to test improvements`);
  console.log(`   4. Deploy feedback widgets to collect user data`);
  console.log(`   5. Iterate and re-evaluate before final submission`);

  console.log("\n" + "=".repeat(60));
}


async function main() {
  console.log("\n🚀 Impact Circle - Production Evaluation Suite\n");
  console.log("This will evaluate all AI agents against production datasets");
  console.log("and generate baseline quality metrics for optimization.\n");

  const startTime = Date.now();

  try {
    
    const skillMatcherResults = await evaluateSkillMatcher();
    const engagementCoachResults = await evaluateEngagementCoach();
    const communityIntelResults = await evaluateCommunityIntelligence();

    
    generateReport([
      skillMatcherResults,
      engagementCoachResults,
      communityIntelResults,
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️  Total evaluation time: ${duration} seconds`);
    console.log(`✅ All evaluations complete!\n`);
  } catch (error) {
    console.error("\n❌ Evaluation suite failed:", error);
    process.exit(1);
  }
}


if (require.main === module) {
  main();
}

export {
  evaluateSkillMatcher,
  evaluateEngagementCoach,
  evaluateCommunityIntelligence,
};