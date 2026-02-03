-- ============================================
-- WOMEN EMPOWERMENT SUPER APP LITE
-- Supabase Schema for Firebase Auth Integration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (with Firebase UID mapping)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL UNIQUE, -- Firebase Auth UID
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  emergency_contact JSONB DEFAULT '{"name": "", "phone": ""}',
  stats JSONB DEFAULT '{"total_points": 0, "level": 1, "badges": []}'::jsonb,
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VAULT DOCUMENTS (Personal, Career, Family)
-- ============================================
CREATE TABLE IF NOT EXISTS vault_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('personal', 'career', 'family', 'legal', 'financial')),
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  thumbnail_url TEXT,
  tags TEXT[],
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOURNALS (Reflection & Growth)
-- ============================================
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'career', 'family', 'gratitude', 'goals')),
  mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'excited', 'anxious', 'grateful')),
  media_urls TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAREER GOALS & TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS career_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('skills', 'certification', 'promotion', 'business', 'side-hustle')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'items',
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAFETY FEATURES
-- ============================================
CREATE TABLE IF NOT EXISTS safety_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('emergency', 'check-in', 'location-share', 'harassment')),
  message TEXT,
  location_data JSONB,
  contacts_notified TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Trusted contacts for safety
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAMILY COLLABORATION
-- ============================================
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by_firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_group_id, firebase_uid)
);

CREATE TABLE IF NOT EXISTS family_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  assigned_to_firebase_uid TEXT REFERENCES users(firebase_uid),
  created_by_firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid),
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family calendar events
CREATE TABLE IF NOT EXISTS family_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'birthday', 'anniversary', 'appointment', 'reminder')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_by_firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid),
  location TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS & GAMIFICATION
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_awarded INTEGER DEFAULT 0,
  icon_url TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_vault_documents_firebase_uid ON vault_documents(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_vault_documents_category ON vault_documents(category);
CREATE INDEX IF NOT EXISTS idx_vault_documents_tags ON vault_documents USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_journals_firebase_uid ON journals(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_journals_type ON journals(type);
CREATE INDEX IF NOT EXISTS idx_journals_tags ON journals USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_career_goals_firebase_uid ON career_goals(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_career_goals_status ON career_goals(status);

CREATE INDEX IF NOT EXISTS idx_safety_alerts_firebase_uid ON safety_alerts(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON safety_alerts(status);

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_firebase_uid ON trusted_contacts(firebase_uid);

CREATE INDEX IF NOT EXISTS idx_family_groups_created_by ON family_groups(created_by_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_family_members_group_id ON family_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_firebase_uid ON family_members(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_family_tasks_group_id ON family_tasks(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_tasks_assigned ON family_tasks(assigned_to_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_family_events_group_id ON family_events(family_group_id);

CREATE INDEX IF NOT EXISTS idx_achievements_firebase_uid ON achievements(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vault_documents_updated_at ON vault_documents;
CREATE TRIGGER update_vault_documents_updated_at BEFORE UPDATE ON vault_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journals_updated_at ON journals;
CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_goals_updated_at ON career_goals;
CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON career_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trusted_contacts_updated_at ON trusted_contacts;
CREATE TRIGGER update_trusted_contacts_updated_at BEFORE UPDATE ON trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_groups_updated_at ON family_groups;
CREATE TRIGGER update_family_groups_updated_at BEFORE UPDATE ON family_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_tasks_updated_at ON family_tasks;
CREATE TRIGGER update_family_tasks_updated_at BEFORE UPDATE ON family_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_events_updated_at ON family_events;
CREATE TRIGGER update_family_events_updated_at BEFORE UPDATE ON family_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(target_firebase_uid TEXT, points_to_add INTEGER)
RETURNS JSONB AS $$
DECLARE
  current_stats JSONB;
BEGIN
  UPDATE users
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{total_points}',
    COALESCE((stats->>'total_points')::INTEGER, 0) + points_to_add
  )
  WHERE firebase_uid = target_firebase_uid
  RETURNING stats INTO current_stats;
  
  RETURN current_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user by Firebase UID
CREATE OR REPLACE FUNCTION get_user_by_firebase_uid(target_firebase_uid TEXT)
RETURNS users AS $$
SELECT * FROM users WHERE firebase_uid = target_firebase_uid;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is member of family group
CREATE OR REPLACE FUNCTION is_family_member(target_firebase_uid TEXT, family_group_id UUID)
RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM family_members
  WHERE family_members.firebase_uid = target_firebase_uid
    AND family_members.family_group_id = is_family_member.family_group_id
    AND family_members.status = 'active'
);
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- 
-- NOTE: These policies use a custom function to extract
-- Firebase UID from the request context. This requires
-- the backend API to pass the Firebase UID via custom header.
-- ============================================

-- Helper function to get Firebase UID from request headers
CREATE OR REPLACE FUNCTION get_request_firebase_uid()
RETURNS TEXT AS $$
SELECT current_setting('request.firebase_uid', TRUE);
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (get_request_firebase_uid() = firebase_uid)
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

-- Vault documents policies
DROP POLICY IF EXISTS "Users can view own vault documents" ON vault_documents;
CREATE POLICY "Users can view own vault documents"
  ON vault_documents FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can insert own vault documents" ON vault_documents;
CREATE POLICY "Users can insert own vault documents"
  ON vault_documents FOR INSERT
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can update own vault documents" ON vault_documents;
CREATE POLICY "Users can update own vault documents"
  ON vault_documents FOR UPDATE
  USING (get_request_firebase_uid() = firebase_uid)
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can delete own vault documents" ON vault_documents;
CREATE POLICY "Users can delete own vault documents"
  ON vault_documents FOR DELETE
  USING (get_request_firebase_uid() = firebase_uid);

-- Journals policies
DROP POLICY IF EXISTS "Users can view own journals" ON journals;
CREATE POLICY "Users can view own journals"
  ON journals FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can insert own journals" ON journals;
CREATE POLICY "Users can insert own journals"
  ON journals FOR INSERT
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can update own journals" ON journals;
CREATE POLICY "Users can update own journals"
  ON journals FOR UPDATE
  USING (get_request_firebase_uid() = firebase_uid)
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can delete own journals" ON journals;
CREATE POLICY "Users can delete own journals"
  ON journals FOR DELETE
  USING (get_request_firebase_uid() = firebase_uid);

-- Career goals policies
DROP POLICY IF EXISTS "Users can view own career goals" ON career_goals;
CREATE POLICY "Users can view own career goals"
  ON career_goals FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can insert own career goals" ON career_goals;
CREATE POLICY "Users can insert own career goals"
  ON career_goals FOR INSERT
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can update own career goals" ON career_goals;
CREATE POLICY "Users can update own career goals"
  ON career_goals FOR UPDATE
  USING (get_request_firebase_uid() = firebase_uid)
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can delete own career goals" ON career_goals;
CREATE POLICY "Users can delete own career goals"
  ON career_goals FOR DELETE
  USING (get_request_firebase_uid() = firebase_uid);

-- Safety alerts policies
DROP POLICY IF EXISTS "Users can view own safety alerts" ON safety_alerts;
CREATE POLICY "Users can view own safety alerts"
  ON safety_alerts FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can insert own safety alerts" ON safety_alerts;
CREATE POLICY "Users can insert own safety alerts"
  ON safety_alerts FOR INSERT
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can update own safety alerts" ON safety_alerts;
CREATE POLICY "Users can update own safety alerts"
  ON safety_alerts FOR UPDATE
  USING (get_request_firebase_uid() = firebase_uid)
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

-- Trusted contacts policies
DROP POLICY IF EXISTS "Users can view own trusted contacts" ON trusted_contacts;
CREATE POLICY "Users can view own trusted contacts"
  ON trusted_contacts FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can insert own trusted contacts" ON trusted_contacts;
CREATE POLICY "Users can insert own trusted contacts"
  ON trusted_contacts FOR INSERT
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can update own trusted contacts" ON trusted_contacts;
CREATE POLICY "Users can update own trusted contacts"
  ON trusted_contacts FOR UPDATE
  USING (get_request_firebase_uid() = firebase_uid)
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can delete own trusted contacts" ON trusted_contacts;
CREATE POLICY "Users can delete own trusted contacts"
  ON trusted_contacts FOR DELETE
  USING (get_request_firebase_uid() = firebase_uid);

-- Family groups policies
DROP POLICY IF EXISTS "Users can view family groups they belong to" ON family_groups;
CREATE POLICY "Users can view family groups they belong to"
  ON family_groups FOR SELECT
  USING (
    created_by_firebase_uid = get_request_firebase_uid() OR
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_groups.id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can create family groups" ON family_groups;
CREATE POLICY "Users can create family groups"
  ON family_groups FOR INSERT
  WITH CHECK (get_request_firebase_uid() = created_by_firebase_uid);

DROP POLICY IF EXISTS "Group admins can update family groups" ON family_groups;
CREATE POLICY "Group admins can update family groups"
  ON family_groups FOR UPDATE
  USING (
    created_by_firebase_uid = get_request_firebase_uid() OR
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_groups.id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.role = 'admin'
        AND family_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Group creators can delete family groups" ON family_groups;
CREATE POLICY "Group creators can delete family groups"
  ON family_groups FOR DELETE
  USING (created_by_firebase_uid = get_request_firebase_uid());

-- Family members policies
DROP POLICY IF EXISTS "Users can view family members of their groups" ON family_members;
CREATE POLICY "Users can view family members of their groups"
  ON family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_group_id = family_members.family_group_id
        AND fm.firebase_uid = get_request_firebase_uid()
        AND fm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert family members" ON family_members;
CREATE POLICY "Users can insert family members"
  ON family_members FOR INSERT
  WITH CHECK (
    firebase_uid = get_request_firebase_uid() OR
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_group_id = family_members.family_group_id
        AND fm.firebase_uid = get_request_firebase_uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update family members" ON family_members;
CREATE POLICY "Users can update family members"
  ON family_members FOR UPDATE
  USING (
    firebase_uid = get_request_firebase_uid() OR
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_group_id = family_members.family_group_id
        AND fm.firebase_uid = get_request_firebase_uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can delete family members" ON family_members;
CREATE POLICY "Users can delete family members"
  ON family_members FOR DELETE
  USING (
    firebase_uid = get_request_firebase_uid() OR
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_group_id = family_members.family_group_id
        AND fm.firebase_uid = get_request_firebase_uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
  );

-- Family tasks policies
DROP POLICY IF EXISTS "Users can view tasks of their family groups" ON family_tasks;
CREATE POLICY "Users can view tasks of their family groups"
  ON family_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_tasks.family_group_id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert tasks to their family groups" ON family_tasks;
CREATE POLICY "Users can insert tasks to their family groups"
  ON family_tasks FOR INSERT
  WITH CHECK (
    created_by_firebase_uid = get_request_firebase_uid() AND
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_tasks.family_group_id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update tasks of their family groups" ON family_tasks;
CREATE POLICY "Users can update tasks of their family groups"
  ON family_tasks FOR UPDATE
  USING (
    created_by_firebase_uid = get_request_firebase_uid() OR
    assigned_to_firebase_uid = get_request_firebase_uid() OR
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_tasks.family_group_id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.role = 'admin'
        AND family_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks of their family groups" ON family_tasks;
CREATE POLICY "Users can delete tasks of their family_groups"
  ON family_tasks FOR DELETE
  USING (
    created_by_firebase_uid = get_request_firebase_uid() OR
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_tasks.family_group_id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.role = 'admin'
        AND family_members.status = 'active'
    )
  );

-- Family events policies
DROP POLICY IF EXISTS "Users can view events of their family groups" ON family_events;
CREATE POLICY "Users can view events of their family groups"
  ON family_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_events.family_group_id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert events to their family groups" ON family_events;
CREATE POLICY "Users can insert events to their family groups"
  ON family_events FOR INSERT
  WITH CHECK (
    created_by_firebase_uid = get_request_firebase_uid() AND
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_events.family_group_id
        AND family_members.firebase_uid = get_request_firebase_uid()
        AND family_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update events of their family groups" ON family_events;
CREATE POLICY "Users can update events of their family groups"
  ON family_events FOR UPDATE
  USING (
    created_by_firebase_uid = get_request_firebase_uid()
  );

DROP POLICY IF EXISTS "Users can delete events of their family groups" ON family_events;
CREATE POLICY "Users can delete events of their family groups"
  ON family_events FOR DELETE
  USING (
    created_by_firebase_uid = get_request_firebase_uid()
  );

-- Achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  USING (get_request_firebase_uid() = firebase_uid);

DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (get_request_firebase_uid() = firebase_uid);

-- ============================================
-- STORAGE BUCKETS (Reference for manual creation)
-- ============================================
-- Create these buckets via Supabase dashboard or API:
-- 1. vault-documents (public: false)
-- 2. journal-media (public: false)
-- 3. profile-photos (public: true)
-- 4. family-files (public: false)

-- Storage policies will be created separately