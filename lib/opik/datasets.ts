import { getOpikClient } from "./config";


export interface DatasetItem {
  input: {
    userId?: string;
    context?: Record<string, any>;
    query?: string;
    [key: string]: any;
  };
  expectedOutput?: {
    confidence?: number;
    matches?: any[];
    recommendations?: string[];
    [key: string]: any;
  };
  metadata?: {
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
    source?: string;
    validatedBy?: string;
    validatedAt?: string;
    tags?: string[];
  };
}


export interface DatasetConfig {
  name: string;
  description: string;
  agentName?: string;
}


export async function createDataset(config: DatasetConfig): Promise<string> {
  const opikClient = getOpikClient();
  if (!opikClient) {
    throw new Error("Opik not configured. Check OPIK_API_KEY and OPIK_WORKSPACE_NAME");
  }

  try {
    
    await opikClient.api.datasets.createDataset({
      name: config.name,
      description: config.description,
    });

    console.log(`✅ Created dataset: ${config.name}`);
    console.log(`   Description: ${config.description}`);

    return config.name; 
  } catch (error) {
    console.error(`Failed to create dataset ${config.name}:`, error);
    throw error;
  }
}


export async function addDatasetItems(
  datasetName: string,
  items: DatasetItem[]
): Promise<void> {
  const opikClient = getOpikClient();
  if (!opikClient) {
    throw new Error("Opik not configured");
  }

  try {
    
    await opikClient.api.datasets.createOrUpdateDatasetItems({
      datasetName,
      items: items.map((item) => ({
        source: "manual",
        data: item.input,
        expectedOutput: item.expectedOutput,
        metadata: item.metadata,
      })),
    });

    console.log(`✅ Added ${items.length} items to dataset: ${datasetName}`);
  } catch (error) {
    console.error(`Failed to add items to dataset ${datasetName}:`, error);
    throw error;
  }
}


export async function getDataset(name: string): Promise<any> {
  const opikClient = getOpikClient();
  if (!opikClient) {
    throw new Error("Opik not configured");
  }

  try {
    // @ts-expect-error - Opik SDK type mismatch
    const dataset = await opikClient.getDataset({ name });

    // @ts-expect-error - Opik SDK Dataset type doesn't expose items property
    console.log(`📊 Loaded dataset: ${name} (${dataset.items?.length || 0} items)`);
    return dataset;
  } catch (error) {
    console.error(`Failed to get dataset ${name}:`, error);
    throw error;
  }
}


export async function deleteDataset(name: string): Promise<void> {
  const opikClient = getOpikClient();
  if (!opikClient) {
    throw new Error("Opik not configured");
  }

  try{
    // @ts-expect-error - Opik SDK type mismatch
    await opikClient.deleteDataset({ name });
    console.log(`🗑️ Deleted dataset: ${name}`);
  } catch (error) {
    console.error(`Failed to delete dataset ${name}:`, error);
    throw error;
  }
}


export async function createSkillMatcherSampleDataset(): Promise<void> {
  const datasetName = "skill-matcher-sample";

  console.log(`🔄 Creating sample dataset: ${datasetName}...`);

  await createDataset({
    name: datasetName,
    description: "Sample test cases for skill matching agent",
    agentName: "skill_matcher",
  });

  const sampleItems: DatasetItem[] = [
    {
      input: {
        userId: "sample-001",
        skills: ["JavaScript", "React", "TypeScript"],
        interests: ["education", "youth mentoring"],
        location: "San Francisco",
        availability: ["weekends"],
      },
      expectedOutput: {
        confidence: 0.85,
        matchCount: 3,
      },
      metadata: {
        difficulty: "medium",
        category: "exact_skill_match",
        source: "manual",
        validatedBy: "expert@impact-circle.org",
        validatedAt: new Date().toISOString(),
        tags: ["skills", "location", "interests"],
      },
    },
    {
      input: {
        userId: "sample-002",
        skills: ["Python", "Data Analysis"],
        interests: ["environmental", "sustainability"],
        location: "Remote",
        availability: ["evenings", "weekends"],
      },
      expectedOutput: {
        confidence: 0.75,
        matchCount: 2,
      },
      metadata: {
        difficulty: "easy",
        category: "partial_skill_match",
        source: "manual",
        validatedAt: new Date().toISOString(),
        tags: ["remote", "environmental"],
      },
    },
    {
      input: {
        userId: "sample-003",
        skills: ["Marketing", "Social Media", "Content Writing"],
        interests: ["arts", "culture", "community building"],
        location: "New York",
        availability: ["flexible"],
      },
      expectedOutput: {
        confidence: 0.90,
        matchCount: 4,
      },
      metadata: {
        difficulty: "easy",
        category: "high_confidence_match",
        source: "manual",
        validatedAt: new Date().toISOString(),
        tags: ["marketing", "arts", "flexible"],
      },
    },
  ];

  await addDatasetItems(datasetName, sampleItems);

  console.log(`✅ Sample dataset created with ${sampleItems.length} items`);
  console.log(`   Use: await getDataset("${datasetName}") to load it`);
}


export async function initializeStandardDatasets(): Promise<void> {
  try {
    await createSkillMatcherSampleDataset();
    console.log("✅ All standard datasets created successfully");
  } catch (error) {
    console.error("Failed to initialize datasets:", error);
    throw error;
  }
}
