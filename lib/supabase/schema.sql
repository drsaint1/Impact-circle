-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  location JSONB NOT NULL, -- {city, state, coordinates: {lat, lng}}
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}', -- {hoursPerWeek, preferredDays[], preferredTimes[]}
  onboarding_completed BOOLEAN DEFAULT FALSE,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  skills_needed TEXT[] DEFAULT '{}',
  volunteers_needed INTEGER DEFAULT 1,
  volunteers_joined INTEGER DEFAULT 0,
  estimated_hours INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in-progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES users(id),
  ai_generated BOOLEAN DEFAULT FALSE,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circles table
CREATE TABLE IF NOT EXISTS circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  goal TEXT NOT NULL,
  max_members INTEGER DEFAULT 10,
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'paused', 'completed')),
  created_by UUID REFERENCES users(id),
  impact_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle members table
CREATE TABLE IF NOT EXISTS circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'co-leader', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  contribution_hours DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE(circle_id, user_id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event', 'task', 'meeting', 'milestone')),
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  assigned_to UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  impact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'user' CHECK (type IN ('user', 'ai', 'system')),
  reactions JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- User impact tracking table
CREATE TABLE IF NOT EXISTS user_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  total_hours DECIMAL DEFAULT 0,
  total_circles INTEGER DEFAULT 0,
  active_circles INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  people_helped INTEGER DEFAULT 0,
  impact_score DECIMAL DEFAULT 0,
  badges JSONB DEFAULT '[]',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Agent evaluations table (for Opik integration)
CREATE TABLE IF NOT EXISTS agent_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  scores JSONB NOT NULL, -- {safety, personalization, actionability, evidenceBased, overall}
  feedback TEXT,
  model TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Agent performance metrics table
CREATE TABLE IF NOT EXISTS agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  invocation_count INTEGER DEFAULT 0,
  total_response_time DECIMAL DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  user_acceptance_count INTEGER DEFAULT 0,
  evaluation_scores JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_location ON issues USING gin(location);
CREATE INDEX IF NOT EXISTS idx_circles_status ON circles(status);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_messages_circle_id ON messages(circle_id);
CREATE INDEX IF NOT EXISTS idx_activities_circle_id ON activities(circle_id);
CREATE INDEX IF NOT EXISTS idx_agent_evaluations_agent_type ON agent_evaluations(agent_type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impact ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Complete and Secure
-- DROP existing policies if any
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view active issues" ON issues;
DROP POLICY IF EXISTS "Authenticated users can create issues" ON issues;
DROP POLICY IF EXISTS "Issue creators can update their issues" ON issues;
DROP POLICY IF EXISTS "Anyone can view circles" ON circles;
DROP POLICY IF EXISTS "Authenticated users can create circles" ON circles;
DROP POLICY IF EXISTS "Circle creators can update their circles" ON circles;
DROP POLICY IF EXISTS "Circle members can view activities" ON activities;
DROP POLICY IF EXISTS "Circle members can create activities" ON activities;
DROP POLICY IF EXISTS "Circle members can view messages" ON messages;
DROP POLICY IF EXISTS "Circle members can send messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view circle members" ON circle_members;
DROP POLICY IF EXISTS "Users can join circles" ON circle_members;
DROP POLICY IF EXISTS "Users can view own impact" ON user_impact;
DROP POLICY IF EXISTS "Users can update own impact" ON user_impact;
DROP POLICY IF EXISTS "Users can insert own impact" ON user_impact;

-- USERS TABLE POLICIES
-- Allow anyone to view all users (for profile discovery)
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ISSUES TABLE POLICIES
-- Anyone can view active issues
CREATE POLICY "Anyone can view active issues"
  ON issues FOR SELECT
  USING (status = 'active' OR status = 'in-progress' OR status = 'completed');

-- Authenticated users can create issues
CREATE POLICY "Authenticated users can create issues"
  ON issues FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Issue creators can update their own issues
CREATE POLICY "Issue creators can update their issues"
  ON issues FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- CIRCLES TABLE POLICIES
-- Anyone can view circles
CREATE POLICY "Anyone can view circles"
  ON circles FOR SELECT
  USING (true);

-- Authenticated users can create circles
CREATE POLICY "Authenticated users can create circles"
  ON circles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Circle creators can update their circles
CREATE POLICY "Circle creators can update their circles"
  ON circles FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- CIRCLE_MEMBERS TABLE POLICIES
-- Anyone can view circle members
CREATE POLICY "Anyone can view circle members"
  ON circle_members FOR SELECT
  USING (true);

-- Authenticated users can join circles
CREATE POLICY "Users can join circles"
  ON circle_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Members can update their own membership
CREATE POLICY "Members can update own membership"
  ON circle_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ACTIVITIES TABLE POLICIES
-- Anyone can view activities
CREATE POLICY "Circle members can view activities"
  ON activities FOR SELECT
  USING (true);

-- Circle members can create activities
CREATE POLICY "Circle members can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = activities.circle_id
      AND user_id = auth.uid()
    )
  );

-- Circle members can update activities
CREATE POLICY "Circle members can update activities"
  ON activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = activities.circle_id
      AND user_id = auth.uid()
    )
  );

-- MESSAGES TABLE POLICIES
-- Circle members can view messages
CREATE POLICY "Circle members can view messages"
  ON messages FOR SELECT
  USING (true);

-- Circle members can send messages
CREATE POLICY "Circle members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (
      auth.uid() = sender_id OR
      EXISTS (
        SELECT 1 FROM circle_members
        WHERE circle_id = messages.circle_id
        AND user_id = auth.uid()
      )
    )
  );

-- USER_IMPACT TABLE POLICIES
-- Users can view their own impact
CREATE POLICY "Users can view own impact"
  ON user_impact FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own impact record
CREATE POLICY "Users can insert own impact"
  ON user_impact FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own impact
CREATE POLICY "Users can update own impact"
  ON user_impact FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
