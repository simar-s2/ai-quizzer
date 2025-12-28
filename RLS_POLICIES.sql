-- RLS Policies for AI Quizzer Database
-- This file contains all Row Level Security policies to ensure data security

-- ============================================
-- QUIZZES TABLE RLS POLICIES
-- ============================================

-- Enable RLS on quizzes table
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Users can view their own quizzes
CREATE POLICY "Users can view own quizzes"
ON public.quizzes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own quizzes
CREATE POLICY "Users can insert own quizzes"
ON public.quizzes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own quizzes
CREATE POLICY "Users can update own quizzes"
ON public.quizzes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own quizzes
CREATE POLICY "Users can delete own quizzes"
ON public.quizzes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- QUESTIONS TABLE RLS POLICIES
-- ============================================

-- Enable RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Users can view questions for quizzes they own
CREATE POLICY "Users can view questions for own quizzes"
ON public.questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

-- Users can insert questions for quizzes they own
CREATE POLICY "Users can insert questions for own quizzes"
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

-- Users can update questions for quizzes they own
CREATE POLICY "Users can update questions for own quizzes"
ON public.questions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

-- Users can delete questions for quizzes they own
CREATE POLICY "Users can delete questions for own quizzes"
ON public.questions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

-- ============================================
-- ATTEMPTS TABLE RLS POLICIES (Already Exist)
-- ============================================
-- The following policies are already in place:
-- - Users can insert own attempts
-- - Users can update own attempts
-- - Users can view own attempts

-- ============================================
-- ATTEMPT_ANSWERS TABLE RLS POLICIES (Already Exist)
-- ============================================
-- The following policies are already in place:
-- - Users can insert own attempt answers
-- - Users can view own attempt answers

-- ============================================
-- ADDITIONAL SECURITY: UPDATE POLICY FOR ATTEMPT_ANSWERS
-- ============================================
-- Add update policy for attempt_answers if it doesn't exist

CREATE POLICY "Users can update own attempt answers"
ON public.attempt_answers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.attempts
    WHERE attempts.id = attempt_answers.attempt_id
    AND attempts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.attempts
    WHERE attempts.id = attempt_answers.attempt_id
    AND attempts.user_id = auth.uid()
  )
);

-- ============================================
-- NOTES FOR FUTURE MARKETPLACE FEATURE
-- ============================================
-- When implementing the marketplace feature, you'll need to add:
-- 1. A 'visibility' column to quizzes table (e.g., 'private', 'public', 'marketplace')
-- 2. Additional SELECT policies for public/marketplace quizzes:
--
-- Example for future use:
-- CREATE POLICY "Users can view public quizzes"
-- ON public.quizzes
-- FOR SELECT
-- TO authenticated
-- USING (visibility = 'public' OR visibility = 'marketplace' OR user_id = auth.uid());
--
-- CREATE POLICY "Users can view questions for public quizzes"
-- ON public.questions
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.quizzes
--     WHERE quizzes.id = questions.quiz_id
--     AND (quizzes.visibility IN ('public', 'marketplace') OR quizzes.user_id = auth.uid())
--   )
-- );
