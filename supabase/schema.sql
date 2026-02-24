-- ============================================================
-- CrowdAndCritic Database Schema
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/rlnkmresgszqiyaamcfp/sql
-- ============================================================

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  imdb_id TEXT UNIQUE,
  tmdb_id INTEGER,
  poster_url TEXT,
  genres TEXT[],
  director TEXT,
  runtime_minutes INTEGER,
  plot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE IF NOT EXISTS movie_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE UNIQUE,
  rt_tomatometer INTEGER,         -- 0-100
  metacritic_score INTEGER,       -- 0-100
  imdb_rating NUMERIC(3,1),       -- 0-10
  rt_audience INTEGER,            -- 0-100
  metacritic_user INTEGER,        -- 0-100
  imdb_votes INTEGER,
  canon_appearances INTEGER DEFAULT 0,
  critic_score NUMERIC(5,2),      -- computed
  audience_score NUMERIC(5,2),    -- computed
  canon_score NUMERIC(5,2),       -- computed
  longevity_bonus NUMERIC(5,2),   -- computed
  popularity_weight NUMERIC(5,2), -- computed
  composite_score NUMERIC(5,2),   -- final ranking score
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon list appearances
CREATE TABLE IF NOT EXISTS canon_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  list_name TEXT NOT NULL,
  rank_on_list INTEGER
);

-- Enable RLS but allow public reads
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_lists ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Public read movies" ON movies;
DROP POLICY IF EXISTS "Public read scores" ON movie_scores;
DROP POLICY IF EXISTS "Public read canon" ON canon_lists;

-- Create read-only public policies
CREATE POLICY "Public read movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read scores" ON movie_scores FOR SELECT USING (true);
CREATE POLICY "Public read canon" ON canon_lists FOR SELECT USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_movie_scores_composite ON movie_scores(composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_movie_scores_movie_id ON movie_scores(movie_id);
CREATE INDEX IF NOT EXISTS idx_canon_lists_movie_id ON canon_lists(movie_id);
