# Impact Circle - Complete Documentation

**AI-Powered Community Action Platform**

Version 1.0 | Built for Comet AI Agents Hackathon 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [AI Agents System](#ai-agents-system)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Frontend Components](#frontend-components)
8. [Opik Integration](#opik-integration)
9. [Setup & Installation](#setup--installation)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Mission

Transform individual intentions into collective community impact by connecting volunteers with local issues through AI-powered intelligent matching, coordination, and impact tracking.

### Problem Statement

**60% of people want to volunteer but don't know where to start.**

Traditional volunteering platforms fail because:
- Generic matching (one-size-fits-all recommendations)
- No coordination support (volunteers left to figure out logistics)
- No impact tracking (can't see if their work matters)
- Motivation fatigue (no engagement support)

### Our Solution

**6 specialized AI agents** working together to:
1. **Discover** local community issues intelligently
2. **Match** users to opportunities where their skills maximize impact
3. **Coordinate** small action circles (5-10 people) with AI-generated plans
4. **Measure** impact with AI vision validation of photo evidence
5. **Coach** volunteers to prevent burnout and maintain engagement
6. **Orchestrate** all agents for seamless user experience

### Unique Value Propositions

1. **Holistic AI Coordination** - Only platform with AI managing discovery, matching, planning, measurement, AND motivation
2. **Small Group Focus** - Action circles (5-10 people) vs massive campaigns
3. **Evidence-Based Impact** - AI vision validates claims using uploaded photos
4. **Behavioral Intelligence** - Learns WHY users succeed/fail, not just WHAT they do
5. **Production-Grade Observability** - Full Opik integration with all 4 advanced features

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  Next.js 14 • React 18 • TypeScript • Tailwind CSS          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Routes (Next.js)                    │
│  /api/issues • /api/matching • /api/circles • /api/impact   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     6 AI Agents System                       │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│ │ Community   │  │   Skill     │  │   Action    │          │
│ │Intelligence │  │  Matcher    │  │ Coordinator │          │
│ └─────────────┘  └─────────────┘  └─────────────┘          │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│ │   Impact    │  │ Engagement  │  │   Master    │          │
│ │ Measurement │  │   Coach     │  │ Coordinator │          │
│ └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ↓             ↓             ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  Gemini 2.0      │ │   Opik       │ │  Supabase    │
│  Flash (AI)      │ │ (Observ.)    │ │  (Database)  │
└──────────────────┘ └──────────────┘ └──────────────┘
```

### Multi-Agent Workflow

**Example: User Discovers and Joins an Issue**

```
1. User Request: "Find me local issues"
   ↓
2. Master Coordinator receives request
   ↓
3. Delegates to Community Intelligence Agent
   ↓
4. Community Intelligence discovers 10 local issues
   ↓
5. Skill Matcher Agent evaluates user fit for each
   ↓
6. Returns ranked matches with explanations
   ↓
7. Opik traces entire workflow
   ↓
8. User sees personalized recommendations
```

**Example: Circle Plans Activity**

```
1. Circle requests action plan
   ↓
2. Action Coordinator Agent analyzes:
   - Issue details
   - Member skills
   - Previous activities
   - Resource constraints
   ↓
3. Generates phased plan with milestones
   ↓
4. Impact Measurement Agent suggests metrics
   ↓
5. Engagement Coach validates workload
   ↓
6. Plan presented to circle
   ↓
7. All interactions traced to Opik
```

---

## AI Agents System

### 1. Community Intelligence Agent

**File**: `lib/ai/agents/community-intelligence.ts`

**Purpose**: Discover and validate community issues

**Key Functions**:
```typescript
discoverIssues(location, interests): Promise<CommunityIssue[]>
validateUserSubmittedIssue(issue): Promise<ValidationResult>
analyzeCauses(issue): Promise<Analysis>
```

**Prompt Strategy**:
- Focuses on local, actionable problems
- Validates feasibility for small groups
- Identifies root causes vs symptoms
- Suggests evidence-based solutions

**Opik Tracking**:
- Traces: Issue discovery requests
- Metrics: Relevance, actionability, safety scores
- Experiments: Different discovery algorithms

**Example Output**:
```json
{
  "title": "Food Insecurity in Mission District",
  "description": "30% of families lack consistent access to nutritious food",
  "category": "Food Security",
  "urgency": "high",
  "feasibleForSmallGroup": true,
  "suggestedActions": [
    "Partner with local grocers for food recovery",
    "Organize weekly community meal prep sessions"
  ]
}
```

---

### 2. Skill Matcher Agent

**File**: `lib/ai/agents/skill-matcher.ts`

**Purpose**: Match users to opportunities where their skills create maximum impact

**Key Functions**:
```typescript
recommendOpportunities(userProfile, issues): Promise<Match[]>
explainFit(user, opportunity): Promise<Explanation>
suggestSkillDevelopment(user): Promise<Recommendations>
```

**Matching Algorithm**:
1. **Skills Match** (40% weight)
   - Direct skill match
   - Transferable skills
   - Learning opportunities

2. **Interest Alignment** (30% weight)
   - Category match
   - Cause alignment
   - Personal values

3. **Availability Fit** (20% weight)
   - Time commitment match
   - Schedule compatibility
   - Location accessibility

4. **Growth Potential** (10% weight)
   - Skill development opportunities
   - Impact amplification potential

**Opik Tracking**:
- Traces: Matching requests with user profile
- Metrics: Match quality, user acceptance rate
- Experiments: Skills-only vs hybrid matching
- Datasets: Test cases for perfect/partial/edge case matches

**Example Output**:
```json
{
  "matchScore": 0.87,
  "opportunity": {...},
  "explanation": "Your web development skills are perfect for building their website. Your interest in education aligns with their tutoring program.",
  "skillsUsed": ["React", "TypeScript", "Teaching"],
  "growthAreas": ["Community organizing", "Grant writing"]
}
```

---

### 3. Action Coordinator Agent

**File**: `lib/ai/agents/action-coordinator.ts`

**Purpose**: Form effective circles and generate detailed action plans

**Key Functions**:
```typescript
formCircle(issue, volunteers): Promise<CircleComposition>
generateActionPlan(circle): Promise<ActionPlan>
facilitateDiscussion(message, context): Promise<Response>
resolveConflict(conflict): Promise<Resolution>
```

**Planning Approach**:
- **Phase 1**: Quick wins (build momentum)
- **Phase 2**: Core activities (main impact)
- **Phase 3**: Sustainability (long-term change)

Each phase includes:
- Specific activities
- Resource requirements
- Success metrics
- Timeline estimates

**Opik Tracking**:
- Traces: Plan generation with circle context
- Metrics: Plan completeness, feasibility, member satisfaction
- Annotation: Low-confidence plans queued for review

**Example Output**:
```json
{
  "phases": [
    {
      "name": "Foundation Building",
      "duration": "2 weeks",
      "activities": [
        {
          "title": "Partner with Local Grocery Stores",
          "assignedTo": ["member-1", "member-2"],
          "resources": ["Business proposal template"],
          "success_metric": "2+ partnerships secured"
        }
      ]
    }
  ]
}
```

---

### 4. Impact Measurement Agent

**File**: `lib/ai/agents/impact-measurement.ts`

**Purpose**: Validate impact claims using AI vision and generate reports

**Key Functions**:
```typescript
validateImpact(activity, claims, photos): Promise<Validation>
generateImpactReport(circle): Promise<Report>
suggestMetrics(activity): Promise<Metrics>
analyzePhotoEvidence(photos): Promise<Analysis>
```

**Vision Validation Process**:
1. User uploads photos of completed activity
2. AI analyzes images for:
   - Evidence of claimed impact
   - Consistency with reported numbers
   - Quality indicators
   - Safety compliance
3. Generates validation result with confidence score
4. Flags suspicious claims for human review

**Opik Tracking**:
- Traces: Validation requests with image analysis
- Metrics: Validation accuracy, false positive rate
- Annotation: Rejected validations queued for review
- Experiments: Moderate vs strict validation thresholds

**Example Output**:
```json
{
  "validated": true,
  "confidence": 0.85,
  "imageAnalysis": {
    "photo1": "Shows food distribution with ~40-50 people present. Consistent with claim of 45 people helped.",
    "photo2": "Setup and cleanup visible, supports 3-hour time claim."
  },
  "discrepancies": [],
  "recommendation": "Impact claim validated. Good photo documentation."
}
```

---

### 5. Engagement Coach Agent

**File**: `lib/ai/agents/engagement-coach.ts`

**Purpose**: Maintain motivation and prevent burnout

**Key Functions**:
```typescript
checkEngagement(user, activity): Promise<EngagementCheck>
detectBurnout(user): Promise<BurnoutRisk>
celebrateMilestone(achievement): Promise<Celebration>
suggestPacing(user): Promise<PacingAdvice>
```

**Engagement Signals**:
- Activity frequency trends
- Commitment vs capacity ratio
- Response time to notifications
- Completion rate of activities
- Self-reported energy levels

**Intervention Triggers**:
- 🔴 **High Risk**: 3+ missed commitments → Suggest break
- 🟡 **Medium Risk**: Declining participation → Gentle check-in
- 🟢 **Milestone**: Goal achieved → Celebrate!

**Opik Tracking**:
- Traces: Engagement checks with user history
- Metrics: Burnout prediction accuracy, retention rate
- Experiments: Reactive vs proactive coaching
- Annotation: High-risk users flagged for human follow-up

**Example Output**:
```json
{
  "status": "healthy",
  "burnoutRisk": "low",
  "message": "You're doing great! You've helped 50 people in the past month while maintaining healthy boundaries.",
  "suggestion": "Consider mentoring a new volunteer next month to amplify your impact.",
  "energyLevel": 8
}
```

---

### 6. Master Coordinator Agent

**File**: `lib/ai/agents/master-coordinator.ts`

**Purpose**: Orchestrate all agents and ensure safety/quality

**Key Functions**:
```typescript
coordinateAgents(request): Promise<CoordinatedResponse>
performSafetyCheck(content): Promise<SafetyResult>
handleEdgeCase(situation): Promise<Handling>
prioritizeActions(queue): Promise<PriorityList>
```

**Coordination Logic**:
```typescript
// Example: User requests recommendations
1. Safety check input
2. Delegate to Community Intelligence (discover issues)
3. Delegate to Skill Matcher (rank by fit)
4. Cross-validate results
5. Safety check outputs
6. Return coordinated response
```

**Safety Checks**:
- Content moderation (hate speech, violence, etc.)
- Privacy protection (PII detection)
- Feasibility validation (realistic commitments)
- User wellbeing (workload assessment)

**Opik Tracking**:
- Traces: All agent coordination workflows
- Metrics: Safety detection rate, coordination latency
- Annotation: Safety violations queued immediately

---

## Technology Stack

### Frontend

**Framework**: Next.js 14.2.21
- React 18.3.1
- TypeScript 5.7.3
- App Router architecture
- Server & Client Components

**Styling**: Tailwind CSS 3.4.17
- Mobile-first responsive design
- Custom component library
- Dark mode support (ready)

**State Management**:
- React Context for global state
- Server actions for mutations
- Optimistic UI updates

**Key Libraries**:
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `react-hook-form` - Form handling

---

### Backend

**Runtime**: Next.js API Routes (Node.js)
- RESTful endpoints
- TypeScript throughout
- Serverless-ready architecture

**AI Integration**:
- **Primary**: Google Gemini 2.0 Flash (`gemini-2.0-flash-exp`)
  - Fast responses (~1-2s)
  - Cost-effective
  - Strong reasoning capabilities

- **Evaluation**: Google Gemini 1.5 Pro (`gemini-1.5-pro`)
  - Higher quality for LLM-as-judge
  - Used in evaluation pipelines

**Observability**: Opik (by Comet)
- Prompt Library integration
- Dataset management
- Experiment tracking
- Annotation queues
- Real-time tracing

**Database**: Supabase (PostgreSQL 15)
- Row Level Security (RLS)
- Real-time subscriptions
- Built-in authentication
- Vector search (ready for embeddings)

---

### Development Tools

**Package Manager**: npm with `--legacy-peer-deps`

**Code Quality**:
- ESLint 9.17.0
- TypeScript strict mode
- Prettier (recommended)

**Testing** (Ready for implementation):
- Jest (unit tests)
- Playwright (E2E tests)
- Opik datasets (agent tests)

---

## Database Schema

### Core Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  location JSONB,  -- {city, state, coordinates}
  skills TEXT[],
  interests TEXT[],
  availability JSONB,  -- {days, timeSlots}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `community_issues`
```sql
CREATE TABLE community_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB NOT NULL,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  tags TEXT[],
  required_skills TEXT[],
  estimated_volunteers_needed INTEGER,
  created_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `action_circles`
```sql
CREATE TABLE action_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES community_issues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('forming', 'active', 'completed', 'paused')),
  max_members INTEGER DEFAULT 10,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `circle_members`
```sql
CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES action_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('leader', 'member', 'contributor')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  contribution_hours NUMERIC DEFAULT 0,
  UNIQUE(circle_id, user_id)
);
```

#### `activities`
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES action_circles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT,
  scheduled_date TIMESTAMPTZ,
  duration_hours NUMERIC,
  assigned_to UUID[] DEFAULT '{}',
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  impact_metrics JSONB,  -- {peopleHelped, hoursContributed, etc}
  photo_evidence TEXT[],  -- URLs to photos
  ai_validated BOOLEAN DEFAULT FALSE,
  validation_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### `chat_messages`
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES action_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'user',  -- 'user', 'system', 'ai'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_issues_location ON community_issues USING GIN (location);
CREATE INDEX idx_issues_category ON community_issues(category);
CREATE INDEX idx_issues_status ON community_issues(status);
CREATE INDEX idx_circles_issue ON action_circles(issue_id);
CREATE INDEX idx_members_user ON circle_members(user_id);
CREATE INDEX idx_members_circle ON circle_members(circle_id);
CREATE INDEX idx_activities_circle ON activities(circle_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_chat_circle ON chat_messages(circle_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at DESC);
```

### Row Level Security (RLS)

```sql
-- Users can only read/update their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Issues are publicly readable
CREATE POLICY issues_select_all ON community_issues
  FOR SELECT USING (true);

-- Circle members can view their circles
CREATE POLICY circles_select_member ON action_circles
  FOR SELECT USING (
    id IN (
      SELECT circle_id FROM circle_members
      WHERE user_id = auth.uid()
    )
  );
```

---

## API Routes

### Issues API

**Base Path**: `/api/issues`

#### `POST /api/issues/discover`
Discover local community issues using AI

**Request**:
```typescript
{
  location: { city: string, state: string },
  interests?: string[],
  limit?: number
}
```

**Response**:
```typescript
{
  success: true,
  data: CommunityIssue[],
  metadata: { model: string, tracingId: string }
}
```

**Agent**: Community Intelligence Agent

---

#### `GET /api/issues/list`
Get paginated list of issues

**Query Params**:
- `category`: Filter by category
- `urgency`: Filter by urgency level
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset

**Response**:
```typescript
{
  success: true,
  data: CommunityIssue[],
  total: number,
  hasMore: boolean
}
```

---

#### `GET /api/issues/[id]`
Get single issue details

**Response**:
```typescript
{
  success: true,
  data: {
    issue: CommunityIssue,
    activeCircles: ActionCircle[],
    stats: { totalMembers, totalImpact }
  }
}
```

---

### Matching API

**Base Path**: `/api/matching`

#### `POST /api/matching/recommend`
Get personalized opportunity recommendations

**Request**:
```typescript
{
  userId: string,
  limit?: number
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    matches: Array<{
      issue: CommunityIssue,
      matchScore: number,
      explanation: string,
      skillsMatch: string[],
      growthOpportunities: string[]
    }>
  }
}
```

**Agent**: Skill Matcher Agent

**Opik Tracing**: Full matching workflow traced

---

### Circles API

**Base Path**: `/api/circles`

#### `GET /api/circles/my`
Get user's circles

**Response**:
```typescript
{
  success: true,
  data: ActionCircle[]
}
```

---

#### `POST /api/circles/create`
Create new action circle

**Request**:
```typescript
{
  issueId: string,
  name: string,
  description?: string
}
```

---

#### `GET /api/circles/[id]`
Get circle details

**Response**:
```typescript
{
  success: true,
  data: {
    circle: ActionCircle,
    issue: CommunityIssue,
    members: CircleMember[],
    activities: Activity[],
    stats: CircleStats
  }
}
```

---

#### `POST /api/circles/[id]/plan-activities`
Generate AI action plan for circle

**Request**:
```typescript
{
  circleId: string,
  context?: string  // Additional context from user
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    phases: Array<{
      name: string,
      duration: string,
      activities: Activity[]
    }>
  }
}
```

**Agent**: Action Coordinator Agent

---

#### `POST /api/circles/[id]/impact`
Validate impact claim with photo evidence

**Request**:
```typescript
{
  activityId: string,
  claims: { peopleHelped: number, hoursContributed: number },
  photos: string[]  // Base64 encoded images
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    validated: boolean,
    confidence: number,
    imageAnalysis: Record<string, string>,
    discrepancies: string[],
    recommendation: string
  }
}
```

**Agent**: Impact Measurement Agent with Gemini Vision

---

#### `GET /api/circles/[id]/impact`
Get impact report for circle

**Response**:
```typescript
{
  success: true,
  data: {
    totalImpact: ImpactMetrics,
    timeline: ImpactEvent[],
    insights: string[]
  }
}
```

---

### Engagement API

**Base Path**: `/api/engagement`

#### `POST /api/engagement/check`
Check user engagement and burnout risk

**Request**:
```typescript
{
  userId: string
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    status: 'healthy' | 'at_risk' | 'burned_out',
    burnoutRisk: number,
    message: string,
    suggestion: string
  }
}
```

**Agent**: Engagement Coach Agent

---

### Insights API

**Base Path**: `/api/insights`

#### `GET /api/insights/comprehensive`
Get comprehensive insights (all agents)

**Response**:
```typescript
{
  success: true,
  data: {
    communityTrends: Insight[],
    personalRecommendations: Recommendation[],
    impactSummary: Summary,
    engagementAdvice: Advice[]
  }
}
```

**Agent**: Master Coordinator Agent (orchestrates all 6 agents)

---

## Frontend Components

### Page Components

#### Landing Page (`/`)
- Hero section with CTA
- Feature showcase
- Social proof
- Mobile-responsive

#### Authentication (`/login`, `/signup`)
- Supabase Auth integration
- Email/password authentication
- OAuth ready (Google, GitHub)

#### Onboarding (`/onboarding`)
4-step wizard:
1. Location selection
2. Skills input
3. Interests selection
4. Availability preferences

#### Dashboard (`/dashboard`)
- Personal stats cards
- Quick actions
- Recent activity feed
- Upcoming commitments

#### Discover Page (`/discover`)
- Issue discovery with AI
- Personalized matching
- Filter by category/urgency
- Card-based layout

#### Issue Detail (`/issues/[id]`)
- Full issue information
- Active circles display
- Impact metrics visualization
- Join circle CTA

#### Circles List (`/circles`)
- Tabs: My Circles / Discover
- Circle cards with stats
- Filter/search

#### Circle Detail (`/circles/[id]`)
- Member list with roles
- Activity timeline
- Real-time chat
- Impact dashboard
- AI action plan generator

#### Profile (`/profile`)
- Edit personal info
- Manage skills/interests
- Update availability
- View contribution history

---

### Reusable Components

**Location**: `components/`

**Key Components**:
- `IssueCard` - Display issue summary
- `CircleCard` - Display circle summary
- `ActivityCard` - Display activity details
- `MemberAvatar` - User avatar with status
- `SkillBadge` - Display skill tags
- `ImpactMetric` - Display metric with icon
- `ChatMessage` - Chat bubble component
- `LoadingSpinner` - Loading states
- `EmptyState` - No data states

---

## Opik Integration

### Complete Documentation

See **[OPIK_README.md](./OPIK_README.md)** for comprehensive Opik integration documentation including:

- All 4 advanced features (Prompts, Datasets, Experiments, Annotations)
- Setup & initialization
- Usage examples for each agent
- Viewing traces in dashboard
- Running evaluations
- A/B testing guide
- Troubleshooting

### Quick Reference

**Setup**:
```bash
npx tsx scripts/setup-opik-features.ts
```

**Test**:
```bash
npx tsx scripts/test-opik-features.ts
```

**View Dashboard**: [comet.com/opik](https://www.comet.com/opik)

---

## Setup & Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Google AI API Key** (Gemini)
- **Supabase Account** (database + auth)
- **Opik API Key** (optional for local dev)

### Installation Steps

1. **Clone repository**
```bash
git clone <repository-url>
cd impact-circle
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Environment setup**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Gemini AI
GOOGLE_API_KEY=your_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Opik (optional for local)
OPIK_API_KEY=your_opik_key
OPIK_WORKSPACE=your_workspace
```

4. **Database setup**

Run SQL from `lib/supabase/schema.sql` in Supabase SQL editor

5. **Seed demo data** (optional)
```bash
node scripts/seed-data.js
```

6. **Initialize Opik**
```bash
npx tsx scripts/setup-opik-features.ts
```

7. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Development Guide

### Project Structure

```
impact-circle/
├── app/                      # Next.js app router
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   ├── onboarding/          # Onboarding flow
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
├── lib/
│   ├── ai/
│   │   ├── agents/         # 6 AI agents
│   │   └── prompts/        # System prompts
│   ├── opik/               # Opik integration
│   │   ├── prompts.ts      # Prompt Library
│   │   ├── datasets.ts     # Datasets
│   │   ├── experiments.ts  # Experiments
│   │   └── annotations.ts  # Annotation Queues
│   ├── supabase/
│   │   ├── client.ts       # Supabase client
│   │   └── schema.sql      # Database schema
│   └── gemini/
│       └── config.ts       # Gemini configuration
├── scripts/                 # Utility scripts
│   ├── setup-opik-features.ts
│   ├── test-opik-features.ts
│   └── seed-data.js
├── public/                  # Static assets
├── DOCUMENTATION.md         # This file
├── OPIK_README.md          # Opik integration guide
└── README.md               # Project overview
```

### Adding a New Agent

1. Create agent file in `lib/ai/agents/`
```typescript
import { createGeminiModel } from "@/lib/gemini/config";
import { getOpikClient } from "@/lib/opik/config";

export async function myNewAgent(input: Input): Promise<Output> {
  const model = createGeminiModel();
  const opik = getOpikClient();

  // Trace to Opik
  const trace = opik?.trace({
    name: "my_new_agent",
    input,
    tags: ["my_agent", "production"]
  });

  try {
    const result = await model.generateContent(prompt);
    const output = parseResult(result);

    trace?.update({ output });
    return output;
  } finally {
    trace?.end();
    await opik?.flush();
  }
}
```

2. Add system prompt in `lib/ai/prompts/system-prompts.ts`

3. Upload to Opik Prompt Library:
```typescript
import { createPrompt, PROMPT_KEYS } from "@/lib/opik/prompts";

await createPrompt(
  "my-new-agent-v1",
  systemPrompt,
  { description: "My new agent", tags: ["agent", "v1"] }
);
```

4. Create API route in `app/api/my-agent/route.ts`

5. Add to Master Coordinator if needed

### Adding a New Page

1. Create page in appropriate directory:
```typescript
// app/(dashboard)/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

2. Add navigation link

3. Add route protection if needed

### Testing Agents Locally

```typescript
// scripts/test-my-agent.ts
import { myNewAgent } from "@/lib/ai/agents/my-new-agent";

async function test() {
  const result = await myNewAgent({ test: "input" });
  console.log("Result:", result);
}

test();
```

Run:
```bash
npx tsx scripts/test-my-agent.ts
```

---

## Deployment

### Vercel Deployment (Recommended)

1. **Connect repository** to Vercel

2. **Add environment variables** in Vercel dashboard:
   - `GOOGLE_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPIK_API_KEY`
   - `OPIK_WORKSPACE`

3. **Deploy**:
```bash
vercel deploy --prod
```

### Environment-Specific Configs

**Production**:
- Enable Opik fully
- Set up monitoring alerts
- Configure rate limiting
- Enable caching

**Staging**:
- Use separate Supabase project
- Use Opik staging workspace
- Enable verbose logging

---

## Testing

### Manual Testing Checklist

**Authentication**:
- [ ] Sign up new user
- [ ] Login existing user
- [ ] Logout

**Onboarding**:
- [ ] Complete all 4 steps
- [ ] Skip and come back later
- [ ] Update profile after onboarding

**Issue Discovery**:
- [ ] Discover issues for location
- [ ] View issue details
- [ ] Check AI matching scores

**Circles**:
- [ ] Create new circle
- [ ] Join existing circle
- [ ] View circle details
- [ ] Generate AI action plan
- [ ] Post in circle chat

**Impact Tracking**:
- [ ] Report activity completion
- [ ] Upload photos
- [ ] Validate with AI vision
- [ ] View impact dashboard

**Engagement**:
- [ ] Check burnout detection
- [ ] Receive coaching message

### Automated Testing (Future)

**Unit Tests** (Jest):
```bash
npm run test
```

**E2E Tests** (Playwright):
```bash
npm run test:e2e
```

**Agent Tests** (Opik Datasets):
```bash
npx tsx scripts/run-evaluations.ts
```

---

## Troubleshooting

### Common Issues

#### "Gemini API Key Invalid"

**Error**: `API key not valid`

**Solution**:
1. Verify key in Google AI Studio
2. Check `.env` file has correct key
3. Restart dev server

#### "Supabase Connection Failed"

**Error**: `Failed to fetch`

**Solution**:
1. Check Supabase project is running
2. Verify URL and anon key in `.env`
3. Check RLS policies

#### "Opik Traces Not Appearing"

**Possible Causes**:
- `OPIK_API_KEY` not set
- Client not initialized
- `flush()` not called

**Debug**:
```typescript
import { getOpikClient } from "@/lib/opik/config";
console.log("Opik:", !!getOpikClient());
```

#### "npm install fails"

**Solution**:
```bash
npm install --legacy-peer-deps
```

#### "Type errors in Opik files"

**Expected**: Some SDK type mismatches are suppressed with `@ts-expect-error`

**If new errors**: Check Opik SDK version compatibility

---

## Performance Optimization

### Current Optimizations

- Server components for static content
- Client components only where needed
- Image optimization with Next.js Image
- API route caching (ready)
- Database indexes on hot paths

### Future Optimizations

1. **Caching**:
   - Redis for frequent queries
   - Gemini response caching
   - Static issue list caching

2. **Rate Limiting**:
   - Per-user API limits
   - Gemini API quota management

3. **CDN**:
   - Static assets on CDN
   - Edge caching for API routes

---

## Security Considerations

### Current Implementation

- ✅ Row Level Security (RLS) on all tables
- ✅ Authentication with Supabase Auth
- ✅ Environment variables for secrets
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React escaping)

### Additional Security (Production)

- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] Content Security Policy (CSP)
- [ ] Input validation on all endpoints
- [ ] File upload validation (photos)
- [ ] Audit logging

---

## Scaling Considerations

### Database

**Current**: Supabase Free Tier (500MB storage)

**Scaling Path**:
1. Upgrade to Pro ($25/mo, 8GB storage)
2. Add read replicas for read-heavy operations
3. Implement connection pooling
4. Archive old data

### AI API Costs

**Current**: Gemini 2.0 Flash free tier

**Scaling Path**:
1. Cache common responses
2. Batch requests where possible
3. Use cheaper models for simple tasks
4. Rate limit per user

### Hosting

**Current**: Vercel Free Tier

**Scaling Path**:
1. Upgrade to Pro ($20/mo)
2. Add edge caching
3. Consider dedicated hosting for heavy workloads

---

## Contributing

### Code Style

- TypeScript strict mode
- Functional components
- Descriptive variable names
- Comments for complex logic

### Commit Messages

```
feat: Add impact validation with AI vision
fix: Correct matching algorithm weights
docs: Update API documentation
chore: Upgrade dependencies
```

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit PR with description

---

## License

MIT License - Built for Comet AI Agents Hackathon 2026

---

## Support & Contact

**Issues**: GitHub Issues
**Documentation**: This file + OPIK_README.md
**Hackathon**: Comet AI Agents Hackathon 2026

---

**Built with ❤️ and AI to empower communities**

Last Updated: February 2026
