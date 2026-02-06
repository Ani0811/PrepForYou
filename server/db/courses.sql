-- PostgreSQL schema for courses
-- Courses that users can enroll in and complete

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  duration integer DEFAULT 120,               -- Duration in minutes
  image_url text,
  tags text[] DEFAULT ARRAY[]::text[],
  difficulty text DEFAULT 'beginner',         -- 'beginner' | 'intermediate' | 'advanced'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses (category);
CREATE INDEX IF NOT EXISTS courses_difficulty_idx ON courses (difficulty);
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON courses (created_at);

-- Difficulty constraint
ALTER TABLE courses
  ADD CONSTRAINT difficulty_check
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));

-- Course progress tracking table
CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,                 -- Progress percentage (0-100)
  status text DEFAULT 'not-started',          -- 'not-started' | 'in-progress' | 'completed'
  started_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_id)                 -- One progress record per user per course
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS course_progress_user_id_idx ON course_progress (user_id);
CREATE INDEX IF NOT EXISTS course_progress_course_id_idx ON course_progress (course_id);
CREATE INDEX IF NOT EXISTS course_progress_status_idx ON course_progress (status);

-- Progress constraint (0-100)
ALTER TABLE course_progress
  ADD CONSTRAINT progress_range
  CHECK (progress >= 0 AND progress <= 100);

-- Status constraint
ALTER TABLE course_progress
  ADD CONSTRAINT status_check
  CHECK (status IN ('not-started', 'in-progress', 'completed'));

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_courses_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for courses table
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_courses_updated_at_column();

-- Function to update updated_at timestamp for course_progress
CREATE OR REPLACE FUNCTION update_course_progress_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for course_progress table
CREATE TRIGGER update_course_progress_updated_at
BEFORE UPDATE ON course_progress
FOR EACH ROW
EXECUTE FUNCTION update_course_progress_updated_at_column();

-- Function to auto-set completed_at when status changes to 'completed'
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
    NEW.progress = 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set completed_at
CREATE TRIGGER set_course_completed_at
BEFORE UPDATE ON course_progress
FOR EACH ROW
EXECUTE FUNCTION set_completed_at();

-- Function to auto-set started_at when status changes from 'not-started'
CREATE OR REPLACE FUNCTION set_started_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('in-progress', 'completed') AND OLD.status = 'not-started' AND NEW.started_at IS NULL THEN
    NEW.started_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set started_at
CREATE TRIGGER set_course_started_at
BEFORE UPDATE ON course_progress
FOR EACH ROW
EXECUTE FUNCTION set_started_at();

-- Add saved_courses column to users table (for Save for Later feature)
-- This allows users to bookmark courses for future enrollment
ALTER TABLE users
ADD COLUMN IF NOT EXISTS saved_courses text[] DEFAULT ARRAY[]::text[];

-- Index for saved courses lookups
CREATE INDEX IF NOT EXISTS users_saved_courses_idx ON users USING GIN (saved_courses);
