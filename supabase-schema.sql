-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  emergency_contact TEXT DEFAULT '',
  stats JSONB DEFAULT '{"total_points": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personal', 'career', 'family')),
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journals table
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'career', 'family')),
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family groups table
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_group_id, user_id)
);

-- Family tasks table
CREATE TABLE IF NOT EXISTS family_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career goals table
CREATE TABLE IF NOT EXISTS career_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'items',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_type ON journals(type);
CREATE INDEX IF NOT EXISTS idx_family_tasks_group_id ON family_tasks(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_group_id ON family_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_career_goals_user_id ON career_goals(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_groups_updated_at BEFORE UPDATE ON family_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_tasks_updated_at BEFORE UPDATE ON family_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON career_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS JSONB AS $$
DECLARE
  current_stats JSONB;
  new_total INTEGER;
BEGIN
  UPDATE users
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{total_points}',
    COALESCE((stats->>'total_points')::INTEGER, 0) + points_to_add
  )
  WHERE id = user_id
  RETURNING stats INTO current_stats;
  
  RETURN current_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for journals
CREATE POLICY "Users can view own journals"
  ON journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journals"
  ON journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals"
  ON journals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals"
  ON journals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for family_groups
CREATE POLICY "Users can view family groups they belong to"
  ON family_groups FOR SELECT
  USING (
    id IN (
      SELECT family_group_id FROM family_members WHERE user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create family groups"
  ON family_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update family groups"
  ON family_groups FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_groups.id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'admin'
    )
  );

CREATE POLICY "Group creators can delete family groups"
  ON family_groups FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for family_members
CREATE POLICY "Users can view family members of their groups"
  ON family_members FOR SELECT
  USING (
    family_group_id IN (
      SELECT family_group_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family members (admin only)"
  ON family_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_members.family_group_id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'admin'
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete family members (admin or self)"
  ON family_members FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_group_id = family_members.family_group_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
  );

-- RLS Policies for family_tasks
CREATE POLICY "Users can view tasks of their family groups"
  ON family_tasks FOR SELECT
  USING (
    family_group_id IN (
      SELECT family_group_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks to their family groups"
  ON family_tasks FOR INSERT
  WITH CHECK (
    family_group_id IN (
      SELECT family_group_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks of their family groups"
  ON family_tasks FOR UPDATE
  USING (
    family_group_id IN (
      SELECT family_group_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks of their family groups"
  ON family_tasks FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_group_id = family_tasks.family_group_id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'admin'
    )
  );

-- RLS Policies for career_goals
CREATE POLICY "Users can view own career goals"
  ON career_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career goals"
  ON career_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career goals"
  ON career_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own career goals"
  ON career_goals FOR DELETE
  USING (auth.uid() = user_id);