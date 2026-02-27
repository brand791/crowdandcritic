-- CrowdAndCritic Score Update (v2 Formula - Simplified)
-- Run this directly in Supabase SQL Editor

UPDATE movie_scores ms
SET
  critic_score = ROUND(((COALESCE(ms.rt_tomatometer, 0) + COALESCE(ms.metacritic_score, 0))::NUMERIC / 2), 2),
  audience_score = ROUND((
    (COALESCE(ms.imdb_rating, 0) * 10 + COALESCE(ms.rt_audience, 0) + COALESCE(ms.metacritic_user, 0))::NUMERIC / 
    NULLIF(
      (CASE WHEN ms.imdb_rating IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN ms.rt_audience IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN ms.metacritic_user IS NOT NULL THEN 1 ELSE 0 END),
      0
    )
  ), 2),
  canon_score = ROUND(LEAST((COALESCE(ms.canon_appearances, 0)::NUMERIC / 15 * 100), 100), 2),
  longevity_bonus = CASE
    WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 10 THEN 0
    WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 20 THEN 1
    WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 30 THEN 2
    WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 40 THEN 3
    WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 50 THEN 4
    ELSE 5
  END::NUMERIC,
  composite_score = ROUND(
    (ROUND(((COALESCE(ms.rt_tomatometer, 0) + COALESCE(ms.metacritic_score, 0))::NUMERIC / 2), 2) * 0.40) +
    (ROUND((
      (COALESCE(ms.imdb_rating, 0) * 10 + COALESCE(ms.rt_audience, 0) + COALESCE(ms.metacritic_user, 0))::NUMERIC / 
      NULLIF(
        (CASE WHEN ms.imdb_rating IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ms.rt_audience IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ms.metacritic_user IS NOT NULL THEN 1 ELSE 0 END),
        0
      )
    ), 2) * 0.40) +
    (ROUND(LEAST((COALESCE(ms.canon_appearances, 0)::NUMERIC / 15 * 100), 100), 2) * 0.15) +
    ((CASE
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 10 THEN 0
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 20 THEN 1
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 30 THEN 2
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 40 THEN 3
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 50 THEN 4
      ELSE 5
    END::NUMERIC) * 0.05),
    2
  ),
  updated_at = NOW()
FROM movies m
WHERE ms.movie_id = m.id;

-- Show results
SELECT 
  m.title,
  m.year,
  ms.composite_score,
  ms.critic_score,
  ms.audience_score,
  ms.canon_score,
  ms.longevity_bonus
FROM movie_scores ms
JOIN movies m ON ms.movie_id = m.id
ORDER BY ms.composite_score DESC;
