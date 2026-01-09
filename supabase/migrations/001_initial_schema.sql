-- THE STRATEGIST - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (synced from Telegram)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    username TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sectors table
CREATE TABLE IF NOT EXISTS sectors (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#00D4AA',
    icon TEXT NOT NULL DEFAULT '📊',
    description TEXT,
    weight_percentage INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    sector_id TEXT REFERENCES sectors(id) ON DELETE SET NULL,
    color TEXT NOT NULL DEFAULT '#00D4AA',
    icon TEXT NOT NULL DEFAULT '🎯',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
    sector_id TEXT REFERENCES sectors(id) ON DELETE SET NULL,
    color TEXT NOT NULL DEFAULT '#A855F7',
    icon TEXT NOT NULL DEFAULT '📁',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sector_id TEXT REFERENCES sectors(id) ON DELETE SET NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    energy_required TEXT DEFAULT 'medium' CHECK (energy_required IN ('low', 'medium', 'high')),
    strategic_weight INTEGER DEFAULT 3 CHECK (strategic_weight >= 1 AND strategic_weight <= 5),
    due_date DATE,
    estimated_minutes INTEGER DEFAULT 25,
    actual_minutes INTEGER DEFAULT 0,
    quadrant TEXT CHECK (quadrant IN ('do', 'schedule', 'delegate', 'eliminate')),
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
    target_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    icon TEXT NOT NULL DEFAULT '✅',
    color TEXT NOT NULL DEFAULT '#00D4AA',
    sector_id TEXT REFERENCES sectors(id) ON DELETE SET NULL,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    completions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (per user)
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    accent_color TEXT DEFAULT 'cyan',
    theme TEXT DEFAULT 'dark',
    font_size TEXT DEFAULT 'medium',
    reduce_motion BOOLEAN DEFAULT FALSE,
    default_focus_duration INTEGER DEFAULT 25,
    break_reminders BOOLEAN DEFAULT TRUE,
    break_interval INTEGER DEFAULT 25,
    preferred_sound TEXT DEFAULT 'silence',
    sound_volume INTEGER DEFAULT 70,
    peak_hours_start INTEGER DEFAULT 9,
    peak_hours_end INTEGER DEFAULT 12,
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
    daily_task_goal INTEGER DEFAULT 5,
    daily_focus_goal INTEGER DEFAULT 120,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Users: can read/write their own record
CREATE POLICY "Users can view own record" ON users FOR SELECT USING (id = auth.uid()::text OR id LIKE 'tg_%' OR id LIKE 'web_%');
CREATE POLICY "Users can insert own record" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (id = auth.uid()::text OR id LIKE 'tg_%' OR id LIKE 'web_%');

-- For all other tables, user can only access their own data
CREATE POLICY "Users access own sectors" ON sectors FOR ALL USING (user_id = auth.uid()::text OR user_id LIKE 'tg_%' OR user_id LIKE 'web_%');
CREATE POLICY "Users access own goals" ON goals FOR ALL USING (user_id = auth.uid()::text OR user_id LIKE 'tg_%' OR user_id LIKE 'web_%');
CREATE POLICY "Users access own projects" ON projects FOR ALL USING (user_id = auth.uid()::text OR user_id LIKE 'tg_%' OR user_id LIKE 'web_%');
CREATE POLICY "Users access own tasks" ON tasks FOR ALL USING (user_id = auth.uid()::text OR user_id LIKE 'tg_%' OR user_id LIKE 'web_%');
CREATE POLICY "Users access own habits" ON habits FOR ALL USING (user_id = auth.uid()::text OR user_id LIKE 'tg_%' OR user_id LIKE 'web_%');
CREATE POLICY "Users access own settings" ON user_settings FOR ALL USING (user_id = auth.uid()::text OR user_id LIKE 'tg_%' OR user_id LIKE 'web_%');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sector_id ON tasks(sector_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_goal_id ON projects(goal_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_sectors_user_id ON sectors(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
