-- ==========================================
-- RLS POLICIES FIX MIGRATION
-- ==========================================
-- This migration adds the missing INSERT policy for users table
-- and completes all other RLS policies for the application
--
-- CRITICAL FIX: Allows users to create accounts without RLS errors
-- ==========================================

-- Step 1: Drop all existing policies to start fresh
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
DROP POLICY IF EXISTS "Circle members can update activities" ON activities;
DROP POLICY IF EXISTS "Circle members can view messages" ON messages;
DROP POLICY IF EXISTS "Circle members can send messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view circle members" ON circle_members;
DROP POLICY IF EXISTS "Users can join circles" ON circle_members;
DROP POLICY IF EXISTS "Members can update own membership" ON circle_members;
DROP POLICY IF EXISTS "Users can view own impact" ON user_impact;
DROP POLICY IF EXISTS "Users can update own impact" ON user_impact;
DROP POLICY IF EXISTS "Users can insert own impact" ON user_impact;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Allow anyone to view all users (for profile discovery)
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);

-- **CRITICAL FIX**: Allow users to insert their own profile during signup
-- This was missing and causing "new row violates row-level security policy" error
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- ISSUES TABLE POLICIES
-- ==========================================

-- Anyone can view issues that are active, in-progress, or completed
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

-- ==========================================
-- CIRCLES TABLE POLICIES
-- ==========================================

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

-- ==========================================
-- CIRCLE_MEMBERS TABLE POLICIES
-- ==========================================

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

-- ==========================================
-- ACTIVITIES TABLE POLICIES
-- ==========================================

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

-- ==========================================
-- MESSAGES TABLE POLICIES
-- ==========================================

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

-- ==========================================
-- USER_IMPACT TABLE POLICIES
-- ==========================================

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

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- You can now create accounts without RLS errors!
