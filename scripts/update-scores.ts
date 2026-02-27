/**
 * CrowdAndCritic Score Update Script
 * Run with: npx tsx scripts/update-scores.ts
 *
 * Fetches all movies from Supabase and recalculates their composite scores
 * using the latest ranking formula (v2).
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';

// Use service role for write access, fall back to anon
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateScores() {
  console.log('🎬 Fetching all movies from database...');

  // Fetch all movies
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('*');

  if (fetchError) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  if (!movies || movies.length === 0) {
    console.log('⚠️  No movies found in database');
    process.exit(0);
  }

  console.log(`📊 Found ${movies.length} movies. Recalculating scores...`);

  // Recalculate scores for each movie
  const updates = movies.map((movie) => {
    const computed = computeAllScores({
      rt_tomatometer: movie.rt_tomatometer,
      metacritic_score: movie.metacritic_score,
      imdb_rating: movie.imdb_rating,
      rt_audience: movie.rt_audience,
      metacritic_user: movie.metacritic_user,
      canon_appearances: movie.canon_appearances,
      year: movie.year,
    });

    return {
      id: movie.id,
      title: movie.title,
      old_composite: movie.composite_score,
      new_composite: computed.composite_score,
      critic_score: computed.critic_score,
      audience_score: computed.audience_score,
      canon_score: computed.canon_score,
      longevity_bonus: computed.longevity_bonus,
    };
  });

  // Log the changes
  console.log('\n📈 Score Updates:');
  console.log('═'.repeat(80));
  updates.forEach((u) => {
    const change = (u.new_composite - u.old_composite).toFixed(2);
    const sign = u.new_composite > u.old_composite ? '⬆️ ' : u.new_composite < u.old_composite ? '⬇️ ' : '➡️ ';
    console.log(
      `${sign} ${u.title.padEnd(40)} ${u.old_composite?.toFixed(1) || 'N/A'} → ${u.new_composite.toFixed(1)} (${change})`
    );
  });

  // Now update the database
  console.log('\n💾 Updating database...');
  const updatedMovies = movies.map((movie, idx) => ({
    ...movie,
    composite_score: updates[idx].new_composite,
    critic_score: updates[idx].critic_score,
    audience_score: updates[idx].audience_score,
    canon_score: updates[idx].canon_score,
    longevity_bonus: updates[idx].longevity_bonus,
  }));

  // Batch update using upsert
  const { error: updateError } = await supabase
    .from('movies')
    .upsert(updatedMovies, { onConflict: 'id' });

  if (updateError) {
    console.error('❌ Error updating movies:', updateError);
    process.exit(1);
  }

  console.log('✅ Successfully updated all movies!');
  console.log(`\n🎉 ${movies.length} movies refreshed with new scoring formula (v2).`);
}

updateScores().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
