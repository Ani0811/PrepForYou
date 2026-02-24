-- PostgreSQL schema for study guides
-- Provides AI-generated summaries, key concepts, quick references,
-- flashcards, and spaced-repetition progress per course.

-- ─────────────────────────────────────────────────────────────────────────────
-- study_guides
-- One optional study guide per course (1:1 with courses)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS study_guides (
  id           uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid       NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  summary      text       NOT NULL,           -- Full markdown course summary
  overview     text,                          -- Short 2-3 sentence overview
  is_published boolean    DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE study_guides
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled';

ALTER TABLE study_guides
  ALTER COLUMN course_id DROP NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS study_guides_course_id_idx ON study_guides (course_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_study_guides_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_guides_updated_at
BEFORE UPDATE ON study_guides
FOR EACH ROW
EXECUTE FUNCTION update_study_guides_updated_at_column();

COMMENT ON TABLE study_guides IS 'AI-generated study guides, one per course';
COMMENT ON COLUMN study_guides.summary IS 'Detailed markdown summary of the whole course';
COMMENT ON COLUMN study_guides.overview IS 'Short 2-3 sentence course overview';

-- ─────────────────────────────────────────────────────────────────────────────
-- key_concepts
-- Glossary-style term/definition pairs belonging to a study guide
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS key_concepts (
  id             uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  study_guide_id uuid       NOT NULL REFERENCES study_guides(id) ON DELETE CASCADE,
  term           text       NOT NULL,
  definition     text       NOT NULL,
  tags           text[]     DEFAULT ARRAY[]::text[],
  "order"        integer    DEFAULT 0,        -- Display order within the guide
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS key_concepts_study_guide_id_idx ON key_concepts (study_guide_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_key_concepts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_key_concepts_updated_at
BEFORE UPDATE ON key_concepts
FOR EACH ROW
EXECUTE FUNCTION update_key_concepts_updated_at_column();

COMMENT ON TABLE key_concepts IS 'Key concept glossary entries for a study guide';

-- ─────────────────────────────────────────────────────────────────────────────
-- quick_references
-- Cheatsheet-style items (formulas, syntax, key facts) per study guide
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quick_references (
  id             uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  study_guide_id uuid       NOT NULL REFERENCES study_guides(id) ON DELETE CASCADE,
  title          text       NOT NULL,
  content        text       NOT NULL,         -- Plain text cheatsheet content
  tags           text[]     DEFAULT ARRAY[]::text[],
  "order"        integer    DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS quick_references_study_guide_id_idx ON quick_references (study_guide_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_quick_references_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quick_references_updated_at
BEFORE UPDATE ON quick_references
FOR EACH ROW
EXECUTE FUNCTION update_quick_references_updated_at_column();

COMMENT ON TABLE quick_references IS 'Quick-reference cheatsheet items for a study guide';

-- ─────────────────────────────────────────────────────────────────────────────
-- flashcards
-- Front/back review cards belonging to a study guide
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flashcards (
  id             uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  study_guide_id uuid       NOT NULL REFERENCES study_guides(id) ON DELETE CASCADE,
  front          text       NOT NULL,         -- Question / prompt side
  back           text       NOT NULL,         -- Answer / explanation side
  difficulty     text       DEFAULT 'medium', -- 'easy' | 'medium' | 'hard'
  tags           text[]     DEFAULT ARRAY[]::text[],
  "order"        integer    DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS flashcards_study_guide_id_idx ON flashcards (study_guide_id);

-- Difficulty constraint
ALTER TABLE flashcards
  ADD CONSTRAINT flashcards_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_flashcards_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flashcards_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_flashcards_updated_at_column();

COMMENT ON TABLE flashcards IS 'Flashcard review cards for a study guide';
COMMENT ON COLUMN flashcards.front IS 'Question or prompt shown to the learner';
COMMENT ON COLUMN flashcards.back  IS 'Answer or explanation revealed on flip';

-- ─────────────────────────────────────────────────────────────────────────────
-- user_flashcard_progress
-- Spaced-repetition (SM-2) state per user per flashcard
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  id              uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id    uuid       NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  rating          integer,                    -- Last rating: 1=again 2=hard 3=good 4=easy
  next_review_at  timestamptz DEFAULT now(),  -- When to show this card next
  interval        integer    DEFAULT 1,       -- Days until next review
  ease_factor     float      DEFAULT 2.5,     -- SM-2 ease factor (min 1.3)
  repetitions     integer    DEFAULT 0,       -- Successful review streak
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (user_id, flashcard_id)              -- One SRS record per user per card
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_flashcard_progress_user_id_idx       ON user_flashcard_progress (user_id);
CREATE INDEX IF NOT EXISTS user_flashcard_progress_flashcard_id_idx  ON user_flashcard_progress (flashcard_id);
CREATE INDEX IF NOT EXISTS user_flashcard_progress_next_review_at_idx ON user_flashcard_progress (next_review_at);

-- Rating constraint
ALTER TABLE user_flashcard_progress
  ADD CONSTRAINT rating_range_check
  CHECK (rating IS NULL OR rating BETWEEN 1 AND 4);

-- Ease factor floor (SM-2 minimum is 1.3)
ALTER TABLE user_flashcard_progress
  ADD CONSTRAINT ease_factor_min_check
  CHECK (ease_factor >= 1.3);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_flashcard_progress_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_flashcard_progress_updated_at
BEFORE UPDATE ON user_flashcard_progress
FOR EACH ROW
EXECUTE FUNCTION update_user_flashcard_progress_updated_at_column();

COMMENT ON TABLE user_flashcard_progress IS 'SM-2 spaced-repetition state per user per flashcard';
COMMENT ON COLUMN user_flashcard_progress.rating         IS 'Last review rating: 1=again 2=hard 3=good 4=easy';
COMMENT ON COLUMN user_flashcard_progress.next_review_at IS 'Next scheduled review date (SM-2)';
COMMENT ON COLUMN user_flashcard_progress.interval       IS 'Days until next review (SM-2 interval)';
COMMENT ON COLUMN user_flashcard_progress.ease_factor    IS 'SM-2 ease factor, minimum 1.3';
COMMENT ON COLUMN user_flashcard_progress.repetitions    IS 'Consecutive successful reviews';
