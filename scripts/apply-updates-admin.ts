/**
 * Apply v2 scoring formula + 6 point boost using service role key
 * Run with: npx tsx scripts/apply-updates-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyUpdates() {
  console.log('🎬 Fetching all movie scores...\n');

  // Fetch all movie scores with movie data
  const { data: results, error: fetchError } = await supabase
    .from('movie_scores')
    .select('*, movies(id, title, year)');

  if (fetchError) {
    console.error('❌ Error fetching scores:', fetchError);
    process.exit(1);
  }

  if (!results || results.length === 0) {
    console.log('⚠️  No scores found');
    process.exit(0);
  }

  console.log(`📊 Found ${results.length} movie scores.\n`);

  // Step 1: Recalculate with v2 formula
  console.log('📈 Step 1: Applying v2 ranking formula...');
  const updates = results.map((record: any) => {
    const movie = record.movies;
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
      v2_score: computed.composite_score,
      v2_with_boost: computed.composite_score + 6,
      critic_score: computed.critic_score,
      audience_score: computed.audience_score,
      canon_score: computed.canon_score,
      longevity_bonus: computed.longevity_bonus,
    };
  });

  // Sort by final score descending
  updates.sort((a: any, b: any) => b.v2_with_boost - a.v2_with_boost);

  // Display the updated rankings
  console.log('\n🏆 New Rankings (v2 + 6 point boost):');
  console.log('═'.repeat(80));
  updates.forEach((u: any, idx: number) => {
    console.log(
      `${(idx + 1).toString().padStart(2)}. ${u.title.padEnd(40)} (${u.year}) → ${u.v2_with_boost.toFixed(1)}`
    );
  });

  // Step 2: Update database with v2 scores + 6 point boost
  console.log('\n💾 Step 2: Updating database...');

  const updateRecords = updates.map((u: any) => ({
    id: u.id,
    movie_id: u.movie_id,
    critic_score: u.critic_score,
    audience_score: u.audience_score,
    canon_score: u.canon_score,
    longevity_bonus: u.longevity_bonus,
    composite_score: u.v2_with_boost,
  }));

  const { error: updateError } = await supabase
    .from('movie_scores')
    .upsert(updateRecords);

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    process.exit(1);
  }

  console.log('✅ Successfully updated all scores!\n');

  // Step 3: Verify the changes
  console.log('🔍 Verifying changes...');
  const { data: verified, error: verifyError } = await supabase
    .from('movie_scores')
    .select('*, movies(title, year)')
    .order('composite_score', { ascending: false })
    .limit(5);

  if (verifyError) {
    console.error('⚠️  Could not verify:', verifyError);
  } else if (verified) {
    console.log('\n✨ Top 5 Movies (after update):');
    verified.forEach((v: any, idx: number) => {
      const movie = v.movies;
      console.log(`${(idx + 1)}. ${movie.title} (${movie.year}) - ${v.composite_score.toFixed(1)}`);
    });
  }

  console.log('\n🎉 All done! Rankings have been updated on the live site.');
}

applyUpdates().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
