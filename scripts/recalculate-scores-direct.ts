/**
 * Recalculate scores using raw SQL execution
 * Run with: SUPABASE_ADMIN_KEY=your_key npx tsx scripts/recalculate-scores-direct.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';

// Try to use service role key from environment
let supabaseKey = process.env.SUPABASE_ADMIN_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log('⚠️  Using anon key - you may need SUPABASE_ADMIN_KEY for write access');
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to recalculate scores v2
const sqlQuery = `
-- Calculate all scores with v2 formula
WITH score_calcs AS (
  SELECT
    ms.id,
    m.title,
    m.year,
    ms.composite_score as old_composite,
    ROUND(
      ((COALESCE(ms.rt_tomatometer, 0) + COALESCE(ms.metacritic_score, 0))::NUMERIC / 2) * 0.40 +
      (((COALESCE(ms.imdb_rating, 0) * 10 + COALESCE(ms.rt_audience, 0) + COALESCE(ms.metacritic_user, 0))::NUMERIC / 
        (CASE WHEN ms.imdb_rating IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN ms.rt_audience IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN ms.metacritic_user IS NOT NULL THEN 1 ELSE 0 END)) * 0.40) +
      ((LEAST((COALESCE(ms.canon_appearances, 0)::NUMERIC / 15 * 100), 100)) * 0.15) +
      ((CASE 
        WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 10 THEN 0
        WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 20 THEN 1
        WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 30 THEN 2
        WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 40 THEN 3
        WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 50 THEN 4
        ELSE 5
      END)::NUMERIC * 0.05),
      2
    ) as new_composite,
    ROUND(((COALESCE(ms.rt_tomatometer, 0) + COALESCE(ms.metacritic_score, 0))::NUMERIC / 2), 2) as critic_score,
    ROUND((((COALESCE(ms.imdb_rating, 0) * 10 + COALESCE(ms.rt_audience, 0) + COALESCE(ms.metacritic_user, 0))::NUMERIC / 
      (CASE WHEN ms.imdb_rating IS NOT NULL THEN 1 ELSE 0 END +
       CASE WHEN ms.rt_audience IS NOT NULL THEN 1 ELSE 0 END +
       CASE WHEN ms.metacritic_user IS NOT NULL THEN 1 ELSE 0 END))), 2) as audience_score,
    ROUND((LEAST((COALESCE(ms.canon_appearances, 0)::NUMERIC / 15 * 100), 100)), 2) as canon_score,
    CASE 
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 10 THEN 0
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 20 THEN 1
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 30 THEN 2
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 40 THEN 3
      WHEN (EXTRACT(YEAR FROM NOW())::INT - m.year) < 50 THEN 4
      ELSE 5
    END as longevity_bonus
  FROM movie_scores ms
  JOIN movies m ON ms.movie_id = m.id
)
UPDATE movie_scores 
SET 
  composite_score = sc.new_composite,
  critic_score = sc.critic_score,
  audience_score = sc.audience_score,
  canon_score = sc.canon_score,
  longevity_bonus = sc.longevity_bonus,
  updated_at = NOW()
FROM score_calcs sc
WHERE movie_scores.id = sc.id
RETURNING 
  movie_scores.id,
  sc.title,
  sc.year,
  sc.old_composite,
  movie_scores.composite_score as new_composite;
`;

async function executeSQL() {
  console.log('🎬 Executing v2 score recalculation...\n');

  try {
    const { data, error } = await supabase.rpc('execute_sql', { query: sqlQuery });

    if (error) {
      console.error('❌ RPC error:', error);
      // Try direct query approach instead
      console.log('\n⚠️  RPC not available, trying direct approach...');
      await executeDirectUpdate();
      return;
    }

    if (data) {
      console.log('✅ SQL executed successfully!');
      console.log('\n📊 Results:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
    console.log('\nℹ️  To manually apply scores, run the SQL in the Supabase SQL editor:');
    console.log('   Path: /home/brand79/.openclaw/workspace/crowdandcritic/supabase/update-scores-v2.sql');
  }
}

async function executeDirectUpdate() {
  console.log('Attempting alternative update method...');
  
  const { data: scores, error: fetchError } = await supabase
    .from('movie_scores')
    .select('*, movies(title, year)');

  if (fetchError || !scores) {
    console.error('❌ Could not fetch scores:', fetchError);
    return;
  }

  console.log(`\n📈 Found ${scores.length} scores. Computing new values...\n`);

  // Calculate new scores locally
  const updates = scores.map((s: any) => {
    const criticScore = (s.rt_tomatometer || 0 + s.metacritic_score || 0) / 2;
    const audienceScore = (
      (s.imdb_rating || 0) * 10 + 
      (s.rt_audience || 0) + 
      (s.metacritic_user || 0)
    ) / (
      (s.imdb_rating ? 1 : 0) +
      (s.rt_audience ? 1 : 0) +
      (s.metacritic_user ? 1 : 0) || 1
    );
    const canonScore = Math.min((s.canon_appearances || 0) / 15 * 100, 100);
    const currentYear = new Date().getFullYear();
    const age = currentYear - s.movies.year;
    const longevityBonus = 
      age < 10 ? 0 :
      age < 20 ? 1 :
      age < 30 ? 2 :
      age < 40 ? 3 :
      age < 50 ? 4 : 5;

    const compositeScore = 
      criticScore * 0.40 +
      audienceScore * 0.40 +
      canonScore * 0.15 +
      longevityBonus * 0.05;

    return {
      id: s.id,
      critic_score: Math.round(criticScore * 100) / 100,
      audience_score: Math.round(audienceScore * 100) / 100,
      canon_score: Math.round(canonScore * 100) / 100,
      longevity_bonus: longevityBonus,
      composite_score: Math.round(compositeScore * 100) / 100,
    };
  });

  // Display results
  console.log('New Composite Scores (v2 Formula):');
  console.log('═'.repeat(80));
  updates.sort((a: any, b: any) => b.composite_score - a.composite_score);
  updates.forEach((u: any, idx: number) => {
    const movie = scores[scores.findIndex(s => s.id === u.id)].movies;
    console.log(`${(idx + 1).toString().padStart(2)}. ${movie.title.padEnd(40)} (${movie.year}) → ${u.composite_score.toFixed(1)}`);
  });

  console.log('\n💾 Attempting to update database...');
  const { error: updateError } = await supabase
    .from('movie_scores')
    .upsert(updates);

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    console.log('\n📝 MANUAL STEPS:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. First, run: supabase/enable-updates.sql');
    console.log('3. Then, run: supabase/update-scores-v2.sql');
    console.log('\nOR use curl with your service role key:');
    console.log('curl -X POST https://rlnkmresgszqiyaamcfp.supabase.co/rest/v1/rpc/execute_sql \\');
    console.log('  -H "Authorization: Bearer SERVICE_ROLE_KEY" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d "{\\"query\\":\\"...\\"}');
  } else {
    console.log('✅ Successfully updated all scores!');
  }
}

executeSQL().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
