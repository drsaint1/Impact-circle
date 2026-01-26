import { calculateModelCost } from "./config";


export interface AgentHealthMetrics {
  agent: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalCalls: number;
    successRate: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    totalCost: number;
    averageFeedbackScore: number;
  };
  topErrors: Array<{
    message: string;
    count: number;
  }>;
}


export interface BudgetConfig {
  agentName: string;
  dailyLimit: number; 
  monthlyLimit: number; 
  alertThreshold: number; 
}


interface BudgetState {
  config: BudgetConfig;
  dailySpend: number;
  monthlySpend: number;
  lastReset: Date;
  history: Array<{
    timestamp: Date;
    cost: number;
    modelName: string;
    tokens: { input: number; output: number };
  }>;
}


const BUDGET_TRACKER = new Map<string, BudgetState>();


export function setBudget(config: BudgetConfig): void {
  BUDGET_TRACKER.set(config.agentName, {
    config,
    dailySpend: 0,
    monthlySpend: 0,
    lastReset: new Date(),
    history: [],
  });

  console.log(
    `✅ Budget set for ${config.agentName}: $${config.dailyLimit}/day, $${config.monthlyLimit}/month`
  );
}


export function trackCost(
  agentName: string,
  modelName: string,
  inputTokens: number,
  outputTokens: number
): {
  cost: number;
  withinBudget: boolean;
  alert?: string;
  budgetStatus?: {
    dailySpent: number;
    dailyRemaining: number;
    dailyPercentage: number;
    monthlySpent: number;
    monthlyRemaining: number;
    monthlyPercentage: number;
  };
} {
  const cost = calculateModelCost(modelName, inputTokens, outputTokens);

  const tracker = BUDGET_TRACKER.get(agentName);
  if (!tracker) {
    
    return { cost, withinBudget: true };
  }

  
  const now = new Date();
  const lastReset = tracker.lastReset;

  if (now.getDate() !== lastReset.getDate()) {
    tracker.dailySpend = 0;
  }

  if (now.getMonth() !== lastReset.getMonth()) {
    tracker.monthlySpend = 0;
  }

  tracker.lastReset = now;

  
  tracker.dailySpend += cost;
  tracker.monthlySpend += cost;

  
  tracker.history.push({
    timestamp: now,
    cost,
    modelName,
    tokens: { input: inputTokens, output: outputTokens },
  });

  
  if (tracker.history.length > 1000) {
    tracker.history = tracker.history.slice(-1000);
  }

  
  const dailyPercent = tracker.dailySpend / tracker.config.dailyLimit;
  const monthlyPercent = tracker.monthlySpend / tracker.config.monthlyLimit;

  
  let withinBudget = true;
  let alert: string | undefined;

  if (dailyPercent >= 1.0) {
    withinBudget = false;
    alert = `Daily budget exceeded: $${tracker.dailySpend.toFixed(4)} / $${tracker.config.dailyLimit}`;
  } else if (monthlyPercent >= 1.0) {
    withinBudget = false;
    alert = `Monthly budget exceeded: $${tracker.monthlySpend.toFixed(2)} / $${tracker.config.monthlyLimit}`;
  } else if (
    dailyPercent >= tracker.config.alertThreshold ||
    monthlyPercent >= tracker.config.alertThreshold
  ) {
    const maxPercent = Math.max(dailyPercent, monthlyPercent);
    alert = `Budget warning: ${(maxPercent * 100).toFixed(1)}% of limit reached`;
  }

  if (alert) {
    console.warn(`⚠️ ${agentName}: ${alert}`);
  }

  return {
    cost,
    withinBudget,
    alert,
    budgetStatus: {
      dailySpent: tracker.dailySpend,
      dailyRemaining: tracker.config.dailyLimit - tracker.dailySpend,
      dailyPercentage: dailyPercent,
      monthlySpent: tracker.monthlySpend,
      monthlyRemaining: tracker.config.monthlyLimit - tracker.monthlySpend,
      monthlyPercentage: monthlyPercent,
    },
  };
}


export function getBudgetStatus(agentName: string): {
  dailySpend: number;
  dailyLimit: number;
  dailyRemaining: number;
  dailyPercentage: number;
  monthlySpend: number;
  monthlyLimit: number;
  monthlyRemaining: number;
  monthlyPercentage: number;
  recentCosts: Array<{
    timestamp: Date;
    cost: number;
    modelName: string;
  }>;
} | null {
  const tracker = BUDGET_TRACKER.get(agentName);
  if (!tracker) return null;

  return {
    dailySpend: tracker.dailySpend,
    dailyLimit: tracker.config.dailyLimit,
    dailyRemaining: tracker.config.dailyLimit - tracker.dailySpend,
    dailyPercentage: tracker.dailySpend / tracker.config.dailyLimit,
    monthlySpend: tracker.monthlySpend,
    monthlyLimit: tracker.config.monthlyLimit,
    monthlyRemaining: tracker.config.monthlyLimit - tracker.monthlySpend,
    monthlyPercentage: tracker.monthlySpend / tracker.config.monthlyLimit,
    recentCosts: tracker.history.slice(-10).map((h) => ({
      timestamp: h.timestamp,
      cost: h.cost,
      modelName: h.modelName,
    })),
  };
}


export function getAllBudgets(): Record<
  string,
  {
    dailySpend: number;
    dailyLimit: number;
    monthlySpend: number;
    monthlyLimit: number;
  }
> {
  const result: Record<string, any> = {};

  for (const [agentName, tracker] of BUDGET_TRACKER.entries()) {
    result[agentName] = {
      dailySpend: tracker.dailySpend,
      dailyLimit: tracker.config.dailyLimit,
      monthlySpend: tracker.monthlySpend,
      monthlyLimit: tracker.config.monthlyLimit,
    };
  }

  return result;
}


export function resetBudget(agentName: string): void {
  const tracker = BUDGET_TRACKER.get(agentName);
  if (tracker) {
    tracker.dailySpend = 0;
    tracker.monthlySpend = 0;
    tracker.lastReset = new Date();
    tracker.history = [];
    console.log(`✅ Budget reset for ${agentName}`);
  }
}


export function setupDefaultBudgets(): void {
  const agents = [
    "skill_matcher",
    "community_intelligence",
    "engagement_coach",
    "impact_measurement",
    "action_coordinator",
    "master_coordinator",
  ];

  for (const agent of agents) {
    setBudget({
      agentName: agent,
      dailyLimit: 5.0, 
      monthlyLimit: 100.0, 
      alertThreshold: 0.8, 
    });
  }

  console.log(`✅ Default budgets set for ${agents.length} agents`);
}


export async function getAgentHealth(
  agentName: string,
  hours: number = 24
): Promise<AgentHealthMetrics | null> {
  console.warn(`getAgentHealth for ${agentName} requires Opik REST API`);

  
  return {
    agent: agentName,
    period: {
      start: new Date(Date.now() - hours * 60 * 60 * 1000),
      end: new Date(),
    },
    metrics: {
      totalCalls: 0,
      successRate: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      errorRate: 0,
      totalCost: 0,
      averageFeedbackScore: 0,
    },
    topErrors: [],
  };
}


export async function checkAgentAlerts(agentName: string): Promise<{
  healthy: boolean;
  alerts: string[];
}> {
  const alerts: string[] = [];

  
  const budgetStatus = getBudgetStatus(agentName);
  if (budgetStatus) {
    if (budgetStatus.dailyPercentage >= 0.9) {
      alerts.push(
        `High daily spend: ${(budgetStatus.dailyPercentage * 100).toFixed(0)}% of limit`
      );
    }
    if (budgetStatus.monthlyPercentage >= 0.9) {
      alerts.push(
        `High monthly spend: ${(budgetStatus.monthlyPercentage * 100).toFixed(0)}% of limit`
      );
    }
  }

  

  return {
    healthy: alerts.length === 0,
    alerts,
  };
}