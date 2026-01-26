// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  location: {
    city: string;
    state: string;
    coordinates?: { lat: number; lng: number };
  };
  skills: string[];
  interests: string[];
  availability: {
    hoursPerWeek: number;
    preferredDays: string[];
    preferredTimes: string[];
  };
  onboardingCompleted: boolean;
  createdAt: string;
  profileImage?: string;
}

// Issue/Opportunity Types
export interface CommunityIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: {
    city: string;
    state: string;
    coordinates?: { lat: number; lng: number };
    address?: string;
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  skillsNeeded: string[];
  volunteersNeeded: number;
  volunteersJoined: number;
  estimatedHours: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  aiGenerated: boolean;
  source?: string; // news, social media, user-submitted
}

export type IssueCategory =
  | 'environment'
  | 'homelessness'
  | 'education'
  | 'seniors'
  | 'youth'
  | 'health'
  | 'food-security'
  | 'housing'
  | 'community-development'
  | 'arts-culture'
  | 'animal-welfare'
  | 'disaster-relief'
  | 'other';

// Action Circle Types
export interface ActionCircle {
  id: string;
  issueId: string;
  name: string;
  description: string;
  goal: string;
  members: CircleMember[];
  maxMembers: number;
  status: 'forming' | 'active' | 'paused' | 'completed';
  createdBy: string;
  createdAt: string;
  activities: Activity[];
  impactMetrics: ImpactMetrics;
}

export interface CircleMember {
  userId: string;
  role: 'leader' | 'co-leader' | 'member';
  joinedAt: string;
  contributionHours: number;
  status: 'active' | 'inactive';
}

export interface Activity {
  id: string;
  circleId: string;
  title: string;
  description: string;
  type: 'event' | 'task' | 'meeting' | 'milestone';
  scheduledDate?: string;
  completedDate?: string;
  assignedTo: string[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  impact?: {
    description: string;
    metrics: Record<string, number>;
  };
  createdAt: string;
}

// Impact Tracking Types
export interface ImpactMetrics {
  volunteersEngaged: number;
  hoursContributed: number;
  peopleHelped: number;
  fundsRaised?: number;
  customMetrics: Record<string, number>;
  lastUpdated: string;
}

export interface UserImpactStats {
  userId: string;
  totalHours: number;
  totalCircles: number;
  activeCircles: number;
  completedActivities: number;
  peopleHelped: number;
  impactScore: number;
  badges: Badge[];
  recentActivities: Activity[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// Chat/Communication Types
export interface Message {
  id: string;
  circleId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: string;
  reactions?: Record<string, string[]>; // emoji -> userIds
}

// AI Agent Types
export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  reasoning?: string;
  metadata?: Record<string, any>;
}

export interface MatchRecommendation {
  issueId: string;
  issue: CommunityIssue;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  considerations: string[];
}

export interface EngagementCheckIn {
  userId: string;
  question: string;
  responses?: string[];
  motivation: string;
  suggestions: string[];
  timestamp: string;
}

// Evaluation Types (for Opik)
export interface EvaluationResult {
  id: string;
  agentType: string;
  inputData: any;
  outputData: any;
  scores: {
    safety: number;
    personalization: number;
    actionability: number;
    evidenceBased?: number;
    overall: number;
  };
  feedback?: string;
  timestamp: string;
  model: string;
}

export interface AgentPerformanceMetrics {
  agentType: string;
  totalInvocations: number;
  avgResponseTime: number;
  avgConfidence: number;
  successRate: number;
  userAcceptanceRate: number;
  evaluationScores: {
    safety: number[];
    personalization: number[];
    actionability: number[];
  };
  lastUpdated: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
