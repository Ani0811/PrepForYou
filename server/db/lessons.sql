-- PostgreSQL schema for lessons
-- Lessons belong to courses and track individual completion

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,                      -- Markdown content
  "order" integer NOT NULL,                   -- Ordering of lessons within a course
  duration integer DEFAULT 0,                 -- Duration in minutes
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS lessons_course_id_idx ON lessons (course_id);
CREATE INDEX IF NOT EXISTS lessons_order_idx ON lessons ("order");

-- Lesson progress tracking table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_progress_id uuid NOT NULL REFERENCES course_progress(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (course_progress_id, lesson_id)      -- One progress record per lesson per course enrollment
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS lesson_progress_course_progress_id_idx ON lesson_progress (course_progress_id);
CREATE INDEX IF NOT EXISTS lesson_progress_lesson_id_idx ON lesson_progress (lesson_id);

-- Function to update updated_at timestamp for lessons
CREATE OR REPLACE FUNCTION update_lessons_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lessons table
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_lessons_updated_at_column();

-- Function to update updated_at timestamp for lesson_progress
CREATE OR REPLACE FUNCTION update_lesson_progress_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lesson_progress table
CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_lesson_progress_updated_at_column();

-- Function to auto-set completed_at when is_completed becomes true
CREATE OR REPLACE FUNCTION set_lesson_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set completed_at
CREATE TRIGGER set_lesson_completed_at
BEFORE UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION set_lesson_completed_at();
