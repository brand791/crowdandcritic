-- Add 6 points to every movie's composite score
-- Run in Supabase SQL Editor

UPDATE movie_scores
SET 
  composite_score = composite_score + 6,
  updated_at = NOW()
WHERE TRUE;

-- Show the updated scores
SELECT 
  m.title,
  m.year,
  (ms.composite_score - 6)::NUMERIC(5,2) as old_score,
  ms.composite_score as new_score,
  '+ 6.0' as change
FROM movie_scores ms
JOIN movies m ON ms.movie_id = m.id
ORDER BY ms.composite_score DESC;
