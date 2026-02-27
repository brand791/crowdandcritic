-- CrowdAndCritic Score Recalculation (v2 Formula)
-- Run in Supabase SQL Editor to update all movie scores with the new ranking formula
--
-- Formula:
-- composite_score = (critic * 0.40) + (audience * 0.40) + (canon * 0.15) + (longevity * 0.05)

-- Step 1: Add helper functions for score calculations
CREATE OR REPLACE FUNCTION calculate_critic_score(
  rt_tomatometer INT,
  metacritic_score INT
) RETURNS NUMERIC AS $$
  SELECT ROUND(((COALESCE(rt_tomatometer, 0) + COALESCE(metacritic_score, 0))::NUMERIC / 2), 2)
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_audience_score(
  imdb_rating NUMERIC,
  rt_audience INT,
  metacritic_user INT
) RETURNS NUMERIC AS $$
  DECLARE
    imdb_scaled NUMERIC;
    count_scores INT;
    sum_scores NUMERIC;
  BEGIN
    imdb_scaled := COALESCE(imdb_rating * 10, 0);
    count_scores := CASE WHEN imdb_rating IS NOT NULL THEN 1 ELSE 0 END +
                   CASE WHEN rt_audience IS NOT NULL THEN 1 ELSE 0 END +
                   CASE WHEN metacritic_user IS NOT NULL THEN 1 ELSE 0 END;
    
    IF count_scores = 0 THEN
      RETURN 0;
    END IF;
    
    sum_scores := imdb_scaled + COALESCE(rt_audience, 0) + COALESCE(metacritic_user, 0);
    RETURN ROUND((sum_scores / count_scores), 2);
  END;
$$ LANGUAGE PLPGSQL IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_canon_score(canon_appearances INT) RETURNS NUMERIC AS $$
  SELECT ROUND(LEAST((canon_appearances::NUMERIC / 15 * 100), 100), 2)
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_longevity_bonus(year INT) RETURNS NUMERIC AS $$
  DECLARE
    age INT;
    current_year INT := EXTRACT(YEAR FROM NOW())::INT;
  BEGIN
    age := current_year - year;
    
    RETURN CASE
      WHEN age < 10 THEN 0
      WHEN age < 20 THEN 1
      WHEN age < 30 THEN 2
      WHEN age < 40 THEN 3
      WHEN age < 50 THEN 4
      ELSE 5
    END;
  END;
$$ LANGUAGE PLPGSQL IMMUTABLE;

-- Step 2: Update all scores with new calculations
UPDATE movie_scores ms
SET
  critic_score = calculate_critic_score(ms.rt_tomatometer, ms.metacritic_score),
  audience_score = calculate_audience_score(ms.imdb_rating, ms.rt_audience, ms.metacritic_user),
  canon_score = calculate_canon_score(ms.canon_appearances),
  longevity_bonus = calculate_longevity_bonus(m.year),
  composite_score = ROUND(
    (calculate_critic_score(ms.rt_tomatometer, ms.metacritic_score) * 0.40) +
    (calculate_audience_score(ms.imdb_rating, ms.rt_audience, ms.metacritic_user) * 0.40) +
    (calculate_canon_score(ms.canon_appearances) * 0.15) +
    (calculate_longevity_bonus(m.year) * 0.05),
    2
  ),
  updated_at = NOW()
FROM movies m
WHERE ms.movie_id = m.id;

-- Step 3: Log the updates
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
