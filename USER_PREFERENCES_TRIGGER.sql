-- ============================================
-- DATABASE TRIGGER FOR USER PREFERENCES
-- Run this in Supabase SQL Editor after creating the schema
-- ============================================

-- This function automatically creates a user_preferences record
-- when a new user signs up (via email/password OR OAuth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default preferences for the new user
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user preferences for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- VERIFY TRIGGER WORKS
-- ============================================

-- You can test this by creating a new user and checking if preferences were created:
-- 
-- SELECT * FROM auth.users WHERE email = 'test@example.com';
-- SELECT * FROM user_preferences WHERE user_id = '<user_id_from_above>';
--
-- Both queries should return a record!

-- ============================================
-- MIGRATION NOTE
-- ============================================

-- If you already have existing users without preferences, run this:
-- 
-- INSERT INTO user_preferences (user_id)
-- SELECT id FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM user_preferences);
-- 
-- This will create preferences for all existing users
