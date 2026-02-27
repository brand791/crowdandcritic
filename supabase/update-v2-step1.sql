-- Step 1: Update composite_score directly with v2 formula
UPDATE movie_scores ms
SET composite_score = ROUND(
  (((COALESCE(ms.rt_tomatometer, 0) + COALESCE(ms.metacritic_score, 0)) / 2.0) * 0.40) +
  (((COALESCE(ms.imdb_rating, 0) * 10 + COALESCE(ms.rt_audience, 0) + COALESCE(ms.metacritic_user, 0)) / 3.0) * 0.40) +
  ((LEAST(COALESCE(ms.canon_appearances, 0)::NUMERIC / 15.0 * 100, 100)) * 0.15) +
  ((CASE WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 10 THEN 0 WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 20 THEN 1 WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 30 THEN 2 WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 40 THEN 3 WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 50 THEN 4 ELSE 5 END) * 0.05),
  2
),
updated_at = NOW()
FROM movies m
WHERE ms.movie_id = m.id;
