-- ============================================
-- WOMEN EMPOWERMENT SUPER APP - SIMPLE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if any)
-- ============================================
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS family_events CASCADE;
DROP TABLE IF EXISTS family_tasks CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS family_groups CASCADE;
DROP TABLE IF EXISTS trusted_contacts CASCADE;
DROP TABLE IF EXISTS safety_alerts CASCADE;
DROP TABLE IF EXISTS career_goals CASCADE;
DROP TABLE IF EXISTS journals CASCADE;
DROP TABLE IF EXISTS vault_documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  emergency_contact JSONB DEFAULT '{"name": "", "phone": ""}',
  stats JSONB DEFAULT '{"total_points": 0, "level": 1, "badges": []}',
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VAULT DOCUMENTS
-- ============================================
CREATE TABLE vault_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personal',
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
-- JOURNALS
-- ============================================
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal',
  mood TEXT,
  media_urls TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAREER GOALS
-- ============================================
CREATE TABLE career_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL,
  goal_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'skills',
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'items',
  deadline DATE,
  status TEXT DEFAULT 'active',
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAFETY FEATURES
-- ============================================
CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT,
  location_data JSONB,
  contacts_notified TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL,
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
CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by_firebase_uid TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  firebase_uid TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_group_id, firebase_uid)
);

CREATE TABLE family_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  assigned_to_firebase_uid TEXT,
  created_by_firebase_uid TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE family_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_by_firebase_uid TEXT NOT NULL,
  location TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_awarded INTEGER DEFAULT 0,
  icon_url TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_vault_documents_firebase_uid ON vault_documents(firebase_uid);
CREATE INDEX idx_vault_documents_category ON vault_documents(category);
CREATE INDEX idx_vault_documents_created_at ON vault_documents(created_at DESC);

CREATE INDEX idx_journals_firebase_uid ON journals(firebase_uid);
CREATE INDEX idx_journals_type ON journals(type);

CREATE INDEX idx_career_goals_firebase_uid ON career_goals(firebase_uid);
CREATE INDEX idx_career_goals_status ON career_goals(status);

CREATE INDEX idx_safety_alerts_firebase_uid ON safety_alerts(firebase_uid);
CREATE INDEX idx_trusted_contacts_firebase_uid ON trusted_contacts(firebase_uid);

CREATE INDEX idx_family_groups_created_by ON family_groups(created_by_firebase_uid);
CREATE INDEX idx_family_members_group_id ON family_members(family_group_id);
CREATE INDEX idx_family_members_firebase_uid ON family_members(firebase_uid);
CREATE INDEX idx_family_tasks_group_id ON family_tasks(family_group_id);
CREATE INDEX idx_family_events_group_id ON family_events(family_group_id);

CREATE INDEX idx_achievements_firebase_uid ON achievements(firebase_uid);

-- ============================================
-- UPDATED AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_documents_updated_at BEFORE UPDATE ON vault_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON career_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
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

-- Permissive policies for development (allows all operations)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vault_documents" ON vault_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on journals" ON journals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on career_goals" ON career_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on safety_alerts" ON safety_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on trusted_contacts" ON trusted_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_groups" ON family_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_members" ON family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_tasks" ON family_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_events" ON family_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on achievements" ON achievements FOR ALL USING (true) WITH CHECK (true);