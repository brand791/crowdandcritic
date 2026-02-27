-- Enable write access for movie_scores table
-- This allows the application to update scores

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all movie_scores updates" ON movie_scores;
DROP POLICY IF EXISTS "Allow all movie_scores inserts" ON movie_scores;

-- Create policies for inserts and updates
CREATE POLICY "Allow all movie_scores updates"
  ON movie_scores
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all movie_scores inserts"
  ON movie_scores
  FOR INSERT
  WITH CHECK (true);

-- Verify policies
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'movie_scores'
ORDER BY policyname;
