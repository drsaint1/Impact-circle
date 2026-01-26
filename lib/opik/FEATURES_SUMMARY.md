# Opik Advanced Features - Quick Reference

## 🚀 All Available Opik Features for Impact Circle

### ✅ Currently Implemented (Basic)
1. **Tracing** - `traceAgentCall()` for all 6 agents
2. **Cost Tracking** - Token usage and model costs
3. **Authenticated Fetch** - Serverless-ready authentication wrapper
4. **Gemini Integration** - Streaming and token counting with tracing

### 📊 Advanced Features (Ready to Implement)

#### 1. Datasets & Evaluation
- **Datasets**: Curated test cases for each agent
- **Automated Evaluation**: Run agents against test datasets
- **Metrics**: Relevance, accuracy, hallucination detection
- **Use Case**: Regression testing before deploying prompt changes

**Files**: `lib/opik/datasets.ts`, `lib/opik/evaluations.ts`

#### 2. Experiments & A/B Testing
- **Prompt Experiments**: Compare multiple prompt variants
- **Model Experiments**: Test gemini-2.0-flash vs gemini-1.5-pro
- **Parameter Experiments**: Test different temperature, top-k settings
- **Winner Selection**: Automatic statistical significance testing

**Files**: `lib/opik/experiments.ts`

#### 3. Annotations & Feedback
- **User Feedback**: Thumbs up/down, star ratings, comments
- **Expert Annotations**: Manual quality review by team
- **Feedback Scores**: Attach scores to any trace
- **Use Case**: Human-in-the-loop evaluation for edge cases

**Files**: `lib/opik/feedback.ts`, `app/api/feedback/route.ts`, `components/FeedbackWidget.tsx`

#### 4. Online Evaluations (Real-Time)
- **Automatic Scoring**: LLM-as-judge on production traces
- **Sampling**: Evaluate 10-20% of traffic (cost control)
- **Real-Time Metrics**: Immediate quality feedback
- **Async Processing**: No user-facing latency

**Files**: `lib/opik/online-evaluations.ts`, `lib/opik/setup-online-eval.ts`

#### 5. Prompt Management
- **Versioned Prompts**: Git-like versioning for all prompts
- **Collaborative Editing**: Team can update prompts via Opik UI
- **Variable Templates**: Mustache-style `{{ variable }}` syntax
- **Prompt Library**: Centralized registry for all 6 agents
- **A/B Testing**: Test prompt versions against each other

**Files**: `lib/opik/prompts.ts`, `lib/opik/prompts/registry.ts`

#### 6. Advanced Metrics
- **Pre-built**:
  - Relevance (LLM-as-judge)
  - Accuracy (vs expected output)
  - Hallucination detection
  - Moderation (safety checks)

- **Custom Metrics**:
  - Response time scoring
  - Confidence calibration
  - Personalization level
  - Actionability score
  - Context precision/recall (for RAG)

**Files**: `lib/opik/metrics/custom.ts`

#### 7. Spans & Nested Traces
- **Granular Tracking**: Break agent calls into sub-operations
- **Performance Analysis**: Find bottlenecks (DB queries, LLM calls, etc.)
- **Operation Types**: LLM, database, API, computation
- **Nested Hierarchy**: Trace → Span → Sub-span

**Example**:
```
skill_matcher (trace)
├── fetch_user_profile (span) - 120ms
├── fetch_opportunities (span) - 350ms
├── llm_skill_matching (span) - 2100ms
└── calculate_scores (span) - 45ms
Total: 2615ms
```

**Files**: `lib/opik/spans.ts`

#### 8. Production Monitoring
- **Health Metrics**: Success rate, latency, error rate, cost
- **Alerts**: Slack/email when thresholds exceeded
- **Dashboard**: Real-time view of all agents
- **Historical Analysis**: Trends over time

**Files**: `lib/opik/monitoring.ts`

#### 9. Budget & Cost Management
- **Per-Agent Budgets**: Daily and monthly limits
- **Cost Tracking**: Real-time spend monitoring
- **Alerts**: Warning at 80%, block at 100%
- **Reports**: Cost breakdown by agent, model, time period

**Files**: `lib/opik/budget.ts`

---

## 🎯 Recommended Implementation Order

### Phase 1: Evaluation (High Value, Low Effort)
**Time**: 2-3 days
**Priority**: HIGH

1. Create datasets for Skill Matcher (100 test cases)
2. Implement automated evaluation
3. Run first experiment comparing prompts
4. **ROI**: Catch regressions before deployment

### Phase 2: User Feedback (Medium Value, Low Effort)
**Time**: 1-2 days
**Priority**: HIGH

1. Add feedback API endpoint
2. Create feedback widget component
3. Deploy to 3 key user flows
4. **ROI**: Real user satisfaction metrics

### Phase 3: Prompt Management (High Value, Medium Effort)
**Time**: 3-4 days
**Priority**: MEDIUM

1. Migrate all prompts to Opik registry
2. Set up versioning system
3. Enable team collaboration
4. **ROI**: Faster prompt iteration, version control

### Phase 4: Online Evaluations (High Value, Medium Effort)
**Time**: 2-3 days
**Priority**: MEDIUM

1. Configure auto-evaluation for all agents
2. Set sampling rates (10-20%)
3. Create dashboard for scores
4. **ROI**: Continuous quality monitoring

### Phase 5: Advanced Features (Medium Value, High Effort)
**Time**: 5-7 days
**Priority**: LOW

1. Implement spans for detailed tracing
2. Set up budget tracking
3. Configure monitoring alerts
4. Build custom metrics
5. **ROI**: Operational excellence, cost control

---

## 📈 Expected Impact

### Before Advanced Integration
- ✅ Basic tracing (you have this now)
- ❌ Manual testing only
- ❌ No user feedback collection
- ❌ Hard to compare prompt versions
- ❌ No production quality monitoring
- ❌ No cost visibility per agent

### After Advanced Integration
- ✅ Automated regression testing
- ✅ Real-time user satisfaction scores
- ✅ A/B test any change with confidence
- ✅ Automatic quality scoring on 10-20% of traffic
- ✅ Budget alerts prevent overruns
- ✅ Detailed performance breakdowns
- ✅ Team collaboration on prompts
- ✅ Production alerts for issues

---

## 💡 Sophistication Examples

### Example 1: Automated Quality Assurance

```typescript
// Before deployment
const result = await runExperiment({
  name: "skill-matcher-v3",
  datasetName: "skill-matcher-evaluation",
  variants: [
    { name: "current", agentFunction: currentVersion },
    { name: "new_prompt", agentFunction: newVersion },
  ],
  metrics: [relevanceMetric, accuracyMetric, personalizationMetric],
});

// Deploy only if new version wins
if (result.winner === "new_prompt") {
  deployToProduction();
}
```

### Example 2: Continuous Monitoring

```typescript
// Check agent health every hour
setInterval(async () => {
  const health = await checkAgentAlerts("skill_matcher");

  if (!health.healthy) {
    sendSlackAlert({
      channel: "#ai-alerts",
      message: `⚠️ Skill Matcher issues:\n${health.alerts.join("\n")}`,
    });
  }
}, 60 * 60 * 1000);
```

### Example 3: User Feedback Loop

```typescript
// Show feedback widget after agent response
<AgentResponse data={response} />
<FeedbackWidget
  traceId={response.traceId}
  onFeedback={(thumbsUp) => {
    // Automatically logged to Opik
    // Appears in dashboard
    // Influences online evaluation scores
  }}
/>
```

---

## 📚 Documentation

- **Main Integration Plan**: `/lib/opik/ADVANCED_INTEGRATION_PLAN.md` (600+ lines, detailed code examples)
- **Basic Usage**: `/lib/opik/README.md` (current implementation guide)
- **This Summary**: Quick reference for all features

---

## 🤖 Agent-Specific Applications

### Skill Matcher
- **Dataset**: 100+ volunteer profiles with verified matches
- **Metrics**: Match accuracy, skill alignment, personalization
- **Experiments**: Test different matching algorithms

### Community Intelligence
- **Dataset**: Community questions with expert answers
- **Metrics**: Relevance, hallucination detection, actionability
- **Feedback**: User ratings on answer quality

### Engagement Coach
- **Dataset**: User scenarios with engagement strategies
- **Metrics**: Personalization, actionability, motivation level
- **Spans**: Track advice generation, strategy selection

### Impact Measurement
- **Dataset**: Projects with verified impact metrics
- **Metrics**: Accuracy of measurements, hallucination detection
- **Online Eval**: Automatic fact-checking

### Action Coordinator
- **Dataset**: Multi-step workflows with optimal sequences
- **Metrics**: Action completeness, sequencing quality
- **Spans**: Track each action recommendation separately

### Master Coordinator
- **Dataset**: Routing decisions with correct agent assignments
- **Metrics**: Routing accuracy (99%+ target)
- **Online Eval**: Evaluate every routing decision

---

## 🚦 Getting Started

Choose your starting point:

**Option A: Quick Win (1 day)**
→ Implement user feedback (Part 3) for immediate user satisfaction data

**Option B: Quality Focus (3 days)**
→ Implement datasets + evaluations (Part 1) for automated testing

**Option C: Full Stack (2 weeks)**
→ Implement all 9 features for production-grade observability

**Want me to implement any of these features now?** Just let me know which one!
