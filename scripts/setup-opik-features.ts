import { SYSTEM_PROMPTS } from "../lib/ai/prompts/system-prompts";
import { createPrompt, PROMPT_KEYS } from "../lib/opik/prompts";
import { initializeStandardDatasets } from "../lib/opik/datasets";
import { ANNOTATION_QUEUES } from "../lib/opik/annotations";

async function setupOpikFeatures() {
  console.log("🚀 Setting up Opik Advanced Features for Impact Circle\n");

  
  console.log("📝 Step 1: Uploading prompts to Opik Prompt Library...");
  try {
    await createPrompt(
      PROMPT_KEYS.COMMUNITY_INTELLIGENCE,
      SYSTEM_PROMPTS.COMMUNITY_INTELLIGENCE,
      {
        description: "System prompt for Community Intelligence Agent",
        tags: ["agent", "community-intelligence", "v1"],
        version: "1.0",
      }
    );

    await createPrompt(
      PROMPT_KEYS.SKILL_MATCHER,
      SYSTEM_PROMPTS.SKILL_MATCHER,
      {
        description: "System prompt for Skill Matcher Agent",
        tags: ["agent", "skill-matcher", "v1"],
        version: "1.0",
      }
    );

    await createPrompt(
      PROMPT_KEYS.ACTION_COORDINATOR,
      SYSTEM_PROMPTS.ACTION_COORDINATOR,
      {
        description: "System prompt for Action Coordinator Agent",
        tags: ["agent", "action-coordinator", "v1"],
        version: "1.0",
      }
    );

    await createPrompt(
      PROMPT_KEYS.IMPACT_MEASUREMENT,
      SYSTEM_PROMPTS.IMPACT_MEASUREMENT,
      {
        description: "System prompt for Impact Measurement Agent",
        tags: ["agent", "impact-measurement", "v1"],
        version: "1.0",
      }
    );

    await createPrompt(
      PROMPT_KEYS.ENGAGEMENT_COACH,
      SYSTEM_PROMPTS.ENGAGEMENT_COACH,
      {
        description: "System prompt for Engagement Coach Agent",
        tags: ["agent", "engagement-coach", "v1"],
        version: "1.0",
      }
    );

    await createPrompt(
      PROMPT_KEYS.MASTER_COORDINATOR,
      SYSTEM_PROMPTS.MASTER_COORDINATOR,
      {
        description: "System prompt for Master Coordinator Agent",
        tags: ["agent", "master-coordinator", "v1"],
        version: "1.0",
      }
    );

    console.log("✅ Prompts uploaded to library\n");
  } catch (error) {
    console.error("❌ Failed to upload prompts:", error);
  }

  
  console.log("📊 Step 2: Creating test datasets...");
  try {
    await initializeStandardDatasets();
    console.log("✅ Datasets created\n");
  } catch (error) {
    console.error("❌ Failed to create datasets:", error);
  }

  
  console.log("🧪 Step 3: Experiments configuration:");
  console.log("   Available experiments in lib/opik/experiments.ts:");
  console.log("   - MATCHING_MODEL: Compare Gemini 2.0 Flash vs 2.5 Pro");
  console.log("   - MATCHING_ALGORITHM: Test different matching strategies");
  console.log("   - ENGAGEMENT_STRATEGY: Reactive vs proactive coaching");
  console.log("   - IMPACT_VALIDATION: Validation strictness levels");
  console.log("   Run experiments using runExperiment() function\n");

  
  console.log("📝 Step 4: Annotation Queues configured:");
  console.log("   Available queues in lib/opik/annotations.ts:");
  for (const [key, queueName] of Object.entries(ANNOTATION_QUEUES)) {
    console.log(`   - ${key}: ${queueName}`);
  }
  console.log("   Use queueForReview() to send outputs for human review\n");

  console.log("✨ Setup complete! Here's what you can do now:\n");
  console.log("1️⃣  View prompts in Opik → Prompt Library");
  console.log("2️⃣  View datasets in Opik → Datasets");
  console.log("3️⃣  Run experiments with runExperiment()");
  console.log("4️⃣  Review queued items in Opik → Annotations");
  console.log("\nAll features are ready to use! 🎉\n");
}

setupOpikFeatures().catch(console.error);