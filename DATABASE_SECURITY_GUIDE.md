# Database Security Implementation Guide

## Overview
This guide will help you secure your AI Quizzer database by implementing Row Level Security (RLS) policies.

## What Changed in the Code

### 1. Quiz Ownership Verification
**File:** `src/lib/supabase/fetchQuiz.ts`

**Change:** Added user ownership check when fetching quizzes:
```typescript
.eq("user_id", user.id) // Only fetch quiz if it belongs to the user
```

This ensures that users can only access quizzes they created.

## How to Implement RLS Policies

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run the RLS Policies

Copy and paste the contents of `RLS_POLICIES.sql` into the SQL editor and execute it.

Or, run each section individually:

#### A. Quizzes Table RLS

```sql
-- Enable RLS on quizzes table
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Users can view their own quizzes
CREATE POLICY "Users can view own quizzes"
ON public.quizzes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own quizzes
CREATE POLICY "Users can insert own quizzes"
ON public.quizzes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own quizzes
CREATE POLICY "Users can update own quizzes"
ON public.quizzes FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own quizzes
CREATE POLICY "Users can delete own quizzes"
ON public.quizzes FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

#### B. Questions Table RLS

```sql
-- Enable RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Users can view questions for quizzes they own
CREATE POLICY "Users can view questions for own quizzes"
ON public.questions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

-- Users can insert questions for quizzes they own
CREATE POLICY "Users can insert questions for own quizzes"
ON public.questions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

-- Users can update questions for quizzes they own
CREATE POLICY "Users can update questions for own quizzes"
ON public.questions FOR UPDATE TO authenticated
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
ON public.questions FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = questions.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);
```

#### C. Attempt Answers Update Policy (Optional Enhancement)

```sql
-- Add update policy for attempt_answers
CREATE POLICY "Users can update own attempt answers"
ON public.attempt_answers FOR UPDATE TO authenticated
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
```

### Step 3: Verify Policies

After running the SQL, verify the policies in Supabase:

1. Go to "Database" → "Tables" in Supabase
2. Click on each table (quizzes, questions, attempts, attempt_answers)
3. Click on "Policies" tab
4. You should see all the policies listed

## Expected Result

### Quizzes Table Policies:
- ✅ Users can view own quizzes (SELECT)
- ✅ Users can insert own quizzes (INSERT)
- ✅ Users can update own quizzes (UPDATE)
- ✅ Users can delete own quizzes (DELETE)

### Questions Table Policies:
- ✅ Users can view questions for own quizzes (SELECT)
- ✅ Users can insert questions for own quizzes (INSERT)
- ✅ Users can update questions for own quizzes (UPDATE)
- ✅ Users can delete questions for own quizzes (DELETE)

### Attempts Table Policies (Already Exist):
- ✅ Users can view own attempts (SELECT)
- ✅ Users can insert own attempts (INSERT)
- ✅ Users can update own attempts (UPDATE)

### Attempt Answers Table Policies:
- ✅ Users can view own attempt answers (SELECT)
- ✅ Users can insert own attempt answers (INSERT)
- ✅ Users can update own attempt answers (UPDATE) - NEW

## Testing

### Test 1: Quiz Access
1. Create a quiz with User A
2. Log in as User B
3. Try to access User A's quiz by URL
4. ✅ Expected: Should redirect or show "Quiz Not Found"

### Test 2: Dashboard
1. Create quizzes with User A
2. Create quizzes with User B
3. Log in as User A
4. ✅ Expected: Should only see User A's quizzes

### Test 3: Questions
1. User A creates quiz with questions
2. User B tries to view questions directly
3. ✅ Expected: No questions returned

## Future: Marketplace Feature

When implementing the marketplace, you'll need to:

1. Add a `visibility` column to quizzes table:
```sql
ALTER TABLE public.quizzes 
ADD COLUMN visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('private', 'public', 'marketplace'));
```

2. Update SELECT policies to allow viewing public/marketplace quizzes
3. Add purchase/access tracking table
4. Implement payment/access control logic

## Troubleshooting

### If policies fail to create:
- Check if policy already exists with same name
- Drop existing policy: `DROP POLICY "policy_name" ON table_name;`
- Re-run the CREATE POLICY command

### If queries suddenly fail:
- Check if user is authenticated
- Verify `user_id` column exists in quizzes table
- Check if `auth.uid()` returns correct user ID

### To disable RLS temporarily (for debugging):
```sql
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
-- Re-enable when done: ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
```

## Summary

After implementing these RLS policies:
- ✅ Users can only see their own quizzes
- ✅ Users can only see questions for their quizzes
- ✅ Users can only see their own attempts
- ✅ Users can only see their own attempt answers
- ✅ Database is secure at the database level
- ✅ Even if client code has bugs, database prevents unauthorized access
- ✅ Ready for future marketplace feature with minimal changes
