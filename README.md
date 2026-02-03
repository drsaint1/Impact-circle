# Impact Circle - AI-Powered Community Action Platform

**Transform your 2026 resolution into real community impact.**

Impact Circle is an AI-powered platform that connects volunteers with local community issues through intelligent matching, coordinated action circles, and measurable impact tracking.

## 🏆 Built for the Comet AI Agents Hackathon

**Track: Social & Community Impact**

This project showcases exceptional use of:
- ✅ **6 Specialized AI Agents** (Community Intelligence, Skill Matcher, Action Coordinator, Impact Measurement, Engagement Coach, Master Coordinator)
- ✅ **Gemini 2.0 Flash** for fast, intelligent responses
- ✅ **Opik Integration** for evaluation, observability, and monitoring
- ✅ **LLM-as-Judge evaluations** for matching quality, safety, and impact validation
- ✅ **Multi-agent coordination** solving real community problems

## 🚀 Features

### For Users
- **AI-Powered Matching**: Get matched to local issues where your skills create maximum impact
- **Action Circles**: Join small groups (5-10 people) tackling specific community problems
- **Intelligent Coordination**: AI helps plan activities, assign tasks, and resolve conflicts
- **AI Vision-Based Impact Validation**: Upload photos of your work for AI to verify impact claims using Gemini vision
- **Impact Tracking**: See measurable results of your contributions with photo evidence
- **Engagement Coaching**: Stay motivated with personalized check-ins and support
- **Issue Detail Pages**: View comprehensive information about community issues, active circles, and impact metrics
- **Circle Detail Pages**: Manage members, view activities, chat in real-time, and track circle progress
- **Mobile-First Design**: Fully responsive interface designed for mobile devices first
- **Real-Time Chat**: Communicate with circle members directly in the app
- **Demo Data Seeding**: Quickly populate database with sample issues and circles for testing

### For Judges
- **Comprehensive Opik Dashboards**: Real-time agent performance metrics
- **Safety Monitoring**: Automated content moderation and validation
- **A/B Testing**: Compare matching algorithms and engagement strategies
- **Evaluation Pipeline**: LLM-as-judge scoring every agent response
- **Regression Tests**: Automated quality assurance

## 🏗️ Architecture

### AI Agents

1. **Community Intelligence Agent**
   - Discovers local community issues
   - Validates user-submitted problems
   - Analyzes root causes and success factors

2. **Skill Matcher Agent**
   - Matches users to opportunities based on skills, interests, and availability
   - Explains fit and identifies growth opportunities
   - Suggests skill development paths

3. **Action Coordinator Agent**
   - Forms effective action circles
   - Generates detailed action plans
   - Facilitates group conversations
   - Resolves conflicts

4. **Impact Measurement Agent**
   - Defines measurable metrics
   - Validates impact claims using uploaded images (Gemini vision)
   - Generates impact reports
   - Suggests next goals
   - Analyzes photo evidence to verify reported numbers

5. **Engagement Coach Agent**
   - Provides personalized motivation
   - Detects burnout risk
   - Celebrates milestones
   - Suggests sustainable pacing

6. **Master Coordinator Agent**
   - Coordinates all other agents
   - Performs safety checks
   - Handles edge cases
   - Prioritizes user wellbeing

### Tech Stack

- **Frontend**: Next.js 14.2.21, React 18.3.1, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.0 Flash (primary), Gemini 1.5 Pro (evaluation)
- **Observability**: Opik for tracing, evaluation, and monitoring
- **Database**: Supabase (PostgreSQL + Auth with Row Level Security)
- **Deployment**: Vercel

### Application Pages

1. **Landing Page** (`/`) - Mobile-responsive marketing page with hero, features, and CTA
2. **Authentication** (`/login`, `/signup`) - Real Supabase authentication
3. **Onboarding** (`/onboarding`) - 4-step wizard: Location → Skills → Interests → Availability
4. **Dashboard** (`/dashboard`) - Personal stats, quick actions, recent activity
5. **Discover Issues** (`/discover`) - Browse issues with AI-powered matching
6. **Issue Detail** (`/issues/[id]`) - Full issue info, skills match, active circles, impact metrics
7. **Circles** (`/circles`) - My Circles and Discover tabs
8. **Circle Detail** (`/circles/[id]`) - Members, activities timeline, real-time chat, impact stats
9. **Profile** (`/profile`) - Edit personal information, skills, interests, availability

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Google AI API key (Gemini)
- Supabase account
- (Optional) Opik API key for production monitoring

### Setup

1. **Clone the repository**
```bash
cd impact-circle
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add:
```env
# Gemini AI
GOOGLE_API_KEY=your_gemini_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Opik (Optional for local dev, required for full monitoring)
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=your_opik_workspace
```

4. **Set up Supabase database**

Go to your Supabase project SQL editor and run:
```bash
# Copy the contents of lib/supabase/schema.sql and execute
```

5. **Seed demo data (optional but recommended)**
```bash
node scripts/seed-data.js
```

This will populate your database with:
- 10 community issues across different categories
- 5 action circles working on those issues

6. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🎯 Getting API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create new key or use existing
4. Copy to `GOOGLE_API_KEY` in `.env`

**Note**: Gemini 2.0 Flash has a generous free tier perfect for hackathon testing!

### Supabase
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy URL and anon/public key
5. Add to `.env`

### Opik (Optional)
1. Go to [Comet.com](https://www.comet.com)
2. Create account/workspace
3. Get API key from settings
4. Add to `.env`

## 🧪 Testing the AI Agents

### Where to Find All 6 Agents in the App

1. **Community Intelligence Agent**
   - **Location**: `/discover` page (Discover Opportunities button)
   - **Function**: Discovers local community issues based on your location and interests
   - **API**: `/api/issues/discover`

2. **Skill Matcher Agent**
   - **Location**: `/discover` page (after discovering issues)
   - **Function**: Matches you to opportunities based on skills, interests, and availability
   - **API**: `/api/matching/recommend`

3. **Action Coordinator Agent**
   - **Location**: `/circles/[id]` page (Get AI Action Plan button)
   - **Function**: Creates detailed phased action plans with activities and milestones
   - **API**: `/api/circles/[id]/plan-activities`

4. **Impact Measurement Agent**
   - **Location**: `/circles/[id]` page (Report Impact button with image upload)
   - **Function**: Validates impact claims by analyzing uploaded photos using Gemini vision
   - **API**: `/api/circles/[id]/impact` (POST for validation, GET for reports)

5. **Engagement Coach Agent**
   - **Location**: Dashboard and background checks
   - **Function**: Monitors engagement, detects burnout risk, provides motivation
   - **API**: `/api/engagement/check`

6. **Master Coordinator Agent**
   - **Location**: `/api/insights/comprehensive`
   - **Function**: Coordinates all other agents, provides holistic insights
   - **Note**: Powers the comprehensive insights feature

### Testing Agents Programmatically

Each agent can be tested independently:

```typescript
// Test Community Intelligence Agent
import { communityIntelligenceAgent } from "@/lib/ai/agents";

const result = await communityIntelligenceAgent.discoverIssues({
  city: "San Francisco",
  state: "CA"
}, ["environment", "homelessness"]);

console.log(result.data); // Array of discovered issues

// Test Impact Measurement with Images
import { impactMeasurementAgent } from "@/lib/ai/agents";

const validation = await impactMeasurementAgent.validateImpact(
  activity,
  { peopleHelped: 50, hoursContributed: 20 },
  [base64Image1, base64Image2] // Photos as evidence
);

console.log(validation.data.imageAnalysis); // AI's analysis of the photos
```

## 📊 Opik Integration Highlights

### 🎯 4 Advanced Opik Features Implemented

Impact Circle showcases exceptional use of Opik's advanced capabilities:

#### 1. **Prompt Library** 📚
- All 6 agent system prompts version-controlled in Opik
- Instant prompt updates without code deployment
- A/B test different prompt variations
- Track which prompts perform best
- **Setup**: `npx tsx scripts/setup-opik-features.ts`

#### 2. **Datasets** 📊
- Pre-built test cases for each agent type:
  - `skill_matching_tests` - 3 test cases (perfect match, unique value, edge cases)
  - `impact_validation_tests` - 3 test cases (realistic, inflated, suspicious)
  - `engagement_coaching_tests` - 2 test cases (burnout, over-commitment)
- Regression testing to ensure quality across versions
- Golden datasets from human-reviewed examples

#### 3. **Experiments** 🧪
- A/B testing framework for data-driven optimization:
  - **MATCHING_MODEL**: Gemini 2.0 Flash vs 2.5 Pro
  - **MATCHING_ALGORITHM**: Skills-only vs hybrid matching
  - **ENGAGEMENT_STRATEGY**: Reactive vs proactive coaching
  - **IMPACT_VALIDATION**: Moderate vs strict validation
- Consistent user assignment (same user = same variant)
- Statistical significance tracking

#### 4. **Annotation Queues** 📝
- Human-in-the-loop quality control
- Auto-queue outputs based on rules:
  - Low confidence (< 0.7) → HIGH priority review
  - Safety flags → HIGH priority review
  - Rejected impact validations → MEDIUM priority review
- 5 pre-configured queues for different review types
- Build training datasets from reviewed examples

### What We Track

1. **Agent Performance**
   - Response times
   - Success rates
   - User acceptance rates
   - Confidence scores

2. **Evaluation Metrics**
   - Safety scores (0-100)
   - Personalization scores (0-100)
   - Actionability scores (0-100)
   - Evidence-based scores (0-100)

3. **Safety Monitoring**
   - Content moderation flags
   - False positive tracking
   - Harmful content detection

4. **A/B Testing**
   - Matching algorithm variants
   - Engagement strategy comparisons
   - Model performance (Gemini Flash vs Pro)

### 🚀 Quick Start: Opik Advanced Features

```bash
# Initialize all 4 Opik advanced features
npx tsx scripts/setup-opik-features.ts
```

This uploads prompts, creates datasets, and configures experiments and annotation queues.

Then view in Opik Dashboard:
1. Go to your Comet.com workspace
2. Navigate to Opik section
3. View **Prompt Library**, **Datasets**, **Traces**, **Experiments**, **Annotations**

📖 **Full Opik Guide**: See [lib/opik/README.md](./lib/opik/README.md) for complete Opik documentation

📖 **Full Project Documentation**: See [DOCUMENTATION.md](./DOCUMENTATION.md) for comprehensive project details

## 🎨 User Flow

1. **Onboarding** → User shares skills, interests, location, availability
2. **Discovery** → AI discovers local issues and matches user
3. **Join Circle** → User joins action circle with 5-10 others
4. **Coordinate** → AI helps plan activities and track tasks
5. **Execute** → Circle takes action on community issue
6. **Measure** → Track and validate impact
7. **Celebrate** → Share achievements and set new goals

## 🏅 Unique Value Propositions

1. **Holistic Coordination**: Only platform where AI agents actively coordinate all aspects (matching, planning, motivation, measurement)

2. **Behavioral Intelligence**: Learns WHY users succeed or fail, not just WHAT they do

3. **Safety-First with Proof**: Opik dashboards show real-time safety monitoring and validation

4. **Adaptive Difficulty**: Plans adjust daily based on user capacity and circumstances

5. **Evidence-Based**: All recommendations backed by best practices and validated impact data

## 📈 Scaling & Production

For production deployment:

1. **Enable Opik fully** for all agent calls
2. **Set up monitoring alerts** for safety violations
3. **Implement rate limiting** for AI calls
4. **Add caching** for common agent responses
5. **Enable A/B testing** for continuous improvement

## 🤝 Contributing

This is a hackathon project, but feedback is welcome!

## 📝 License

MIT License - Built for Comet AI Agents Hackathon 2026

## 🙏 Acknowledgments

- **Comet** for Opik and hackathon organization
- **Google** for Gemini API
- **Vercel** for hosting platform
- **Supabase** for database infrastructure

---

**Built with ❤️ and AI to empower communities**
