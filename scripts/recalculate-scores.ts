/**
 * Recalculate scores using the new ranking formula (v2)
 * Run with: npx tsx scripts/recalculate-scores.ts
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function recalculateScores() {
  console.log('🎬 Fetching all movie scores from database...');

  // Join movies and scores to get all data
  const { data: results, error: fetchError } = await supabase
    .from('movie_scores')
    .select('*, movies(id, title, year)');

  if (fetchError) {
    console.error('❌ Error fetching scores:', fetchError);
    process.exit(1);
  }

  if (!results || results.length === 0) {
    console.log('⚠️  No scores found in database');
    process.exit(0);
  }

  console.log(`📊 Found ${results.length} movie scores. Recalculating with v2 formula...`);

  // Recalculate all scores
  const updates = results.map((record) => {
    const movie = record.movies as any;
    const computed = computeAllScores({
      rt_tomatometer: record.rt_tomatometer,
      metacritic_score: record.metacritic_score,
      imdb_rating: record.imdb_rating,
      rt_audience: record.rt_audience,
      metacritic_user: record.metacritic_user,
      canon_appearances: record.canon_appearances || 0,
      year: movie.year,
    });

    return {
      id: record.id,
      movie_id: record.movie_id,
      title: movie.title,
      year: movie.year,
      old_composite: record.composite_score,
      new_composite: computed.composite_score,
      critic_score: computed.critic_score,
      audience_score: computed.audience_score,
      canon_score: computed.canon_score,
      longevity_bonus: computed.longevity_bonus,
    };
  });

  // Display changes
  console.log('\n📈 Score Updates (v2 Formula):');
  console.log('═'.repeat(100));

  // Sort by new composite score descending
  updates.sort((a, b) => b.new_composite - a.new_composite);

  let totalChange = 0;
  updates.forEach((u) => {
    const change = u.new_composite - (u.old_composite || 0);
    const sign = u.new_composite > (u.old_composite || 0) ? '⬆️ ' : u.new_composite < (u.old_composite || 0) ? '⬇️ ' : '➡️ ';
    const oldScore = u.old_composite ? u.old_composite.toFixed(1) : 'N/A';
    console.log(
      `${sign} ${u.title.padEnd(40)} (${u.year}) ${oldScore.padStart(6)} → ${u.new_composite.toFixed(1).padStart(6)} (${change >= 0 ? '+' : ''}${change.toFixed(1)})`
    );
    totalChange += change;
  });

  console.log('═'.repeat(100));
  console.log(`Total change across all movies: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)}\n`);

  // Update database
  console.log('💾 Updating database...');

  // Prepare update records
  const updateRecords = updates.map((u) => ({
    id: u.id,
    movie_id: u.movie_id,
    critic_score: u.critic_score,
    audience_score: u.audience_score,
    canon_score: u.canon_score,
    longevity_bonus: u.longevity_bonus,
    composite_score: u.new_composite,
  }));

  // Batch update using upsert
  const { error: updateError } = await supabase.from('movie_scores').upsert(updateRecords);

  if (updateError) {
    console.error('❌ Error updating scores:', updateError);
    process.exit(1);
  }

  console.log('✅ Successfully updated all movie scores!');
  console.log(`\n🎉 ${results.length} movies refreshed with the new ranking formula (v2).`);
  console.log('Rankings should now reflect critic, audience, canon, and longevity factors equally.');
}

recalculateScores().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
