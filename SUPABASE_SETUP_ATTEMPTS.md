# Supabase Database Setup for AI Marking System

## 1. Create the Attempts Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create attempts table
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL, -- Percentage out of 100
  total_marks INTEGER NOT NULL,
  marks_obtained DECIMAL(5,2) NOT NULL,
  feedback JSONB, -- Overall feedback from AI
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_taken INTEGER, -- Time in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attempt_answers table (detailed answers for each question)
CREATE TABLE attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN,
  marks_awarded DECIMAL(5,2),
  marks_possible DECIMAL(5,2),
  ai_feedback TEXT, -- AI feedback for this specific answer
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_quiz_id ON attempts(quiz_id);
CREATE INDEX idx_attempts_completed_at ON attempts(completed_at DESC);
CREATE INDEX idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX idx_attempt_answers_question_id ON attempt_answers(question_id);

-- Enable Row Level Security
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attempts
CREATE POLICY "Users can view own attempts" ON attempts 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON attempts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON attempts 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for attempt_answers
CREATE POLICY "Users can view own attempt answers" ON attempt_answers 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM attempts 
      WHERE attempts.id = attempt_answers.attempt_id 
      AND attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own attempt answers" ON attempt_answers 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM attempts 
      WHERE attempts.id = attempt_answers.attempt_id 
      AND attempts.user_id = auth.uid()
    )
  );
```

## 2. Update Quizzes Table (Optional Enhancement)

Add a field to track number of attempts:

```sql
-- Add attempts_count to quizzes table
ALTER TABLE quizzes 
ADD COLUMN attempts_count INTEGER DEFAULT 0;

-- Create a trigger to update attempts_count
CREATE OR REPLACE FUNCTION update_quiz_attempts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quizzes 
    SET attempts_count = attempts_count + 1 
    WHERE id = NEW.quiz_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_attempts_count
AFTER INSERT ON attempts
FOR EACH ROW
EXECUTE FUNCTION update_quiz_attempts_count();
```

## 3. Delete the old answers table (if not needed)

If you want to clean up the old answers table since we're now using attempt_answers:

```sql
-- OPTIONAL: Only run if you want to remove the old answers table
DROP TABLE IF EXISTS answers CASCADE;
```

## 4. Regenerate TypeScript Types

After running the SQL above, regenerate your types:

```bash
npx supabase gen types typescript --project-id "mruvitwvngqqnpyfiwxa" --schema public > src/types/database.types.ts
```

## 5. Verify Setup

Check that tables were created successfully:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('attempts', 'attempt_answers');
```

## Notes

- The `attempts` table stores the overall quiz attempt with score and total marks
- The `attempt_answers` table stores individual answers with AI feedback
- All tables have proper RLS policies for security
- Indexes are added for query performance
- Cascade deletes ensure data integrity
