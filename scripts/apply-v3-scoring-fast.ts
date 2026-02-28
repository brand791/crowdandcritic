/**
 * Apply v3 scoring formula WITHOUT Reddit crawling (for testing)
 * Uses simulated popularity scores
 * Run with: npx tsx scripts/apply-v3-scoring-fast.ts
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
// Use service role key for writes (has admin permissions)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyV3ScoringFast() {
  console.log('═'.repeat(100));
  console.log('APPLYING V3 SCORING (Fast Mode - No Reddit Crawling)');
  console.log('═'.repeat(100) + '\n');

  // Step 1: Fetch all movies with scores
  console.log('📊 Step 1: Fetching movies...');
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(*)')
    .order('title');

  if (fetchError || !movies) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  console.log(`✅ Found ${movies.length} movies\n`);

  // Step 2: Calculate new composite scores with simulated popularity
  console.log('🎯 Step 2: Recalculating composite scores with v3 formula...\n');

  const updates = movies
    .map((movie) => {
      // Note: Supabase returns a single object, not an array
      const score = movie.movie_scores as any;
      if (!score || !score.id) {
        console.warn(`⚠️  Skipping ${movie.title} - no scores`);
        return null;
      }

      // For now, simulate popularity based on year (older = more popular)
      // This is just for testing v3 formula math
      const ageYears = 2026 - movie.year;
      let simulatedPopularity = 0;
      if (ageYears > 40) simulatedPopularity = 4; // Old classics
      else if (ageYears > 20) simulatedPopularity = 2; // Older films
      else if (ageYears > 5) simulatedPopularity = 1; // Recent-ish
      // else 0 for very new

      const computed = computeAllScores({
        rt_tomatometer: score.rt_tomatometer,
        metacritic_score: score.metacritic_score,
        imdb_rating: score.imdb_rating,
        rt_audience: score.rt_audience,
        metacritic_user: score.metacritic_user,
        canon_appearances: score.canon_appearances || 0,
        popularity_score: simulatedPopularity,
        year: movie.year,
      });

      return {
        id: score.id,
        movie_id: score.movie_id,
        title: movie.title,
        year: movie.year,
        v2_score: score.composite_score,
        v3_score: computed.composite_score,
        popularity: simulatedPopularity,
        critic_score: computed.critic_score,
        audience_score: computed.audience_score,
        canon_score: computed.canon_score,
        longevity_bonus: computed.longevity_bonus,
      };
    })
    .filter((u): u is NonNullable<typeof u> => u !== null);

  // Sort by v3 score
  updates.sort((a, b) => b.v3_score - a.v3_score);

  // Display new rankings
  console.log('🏆 NEW V3 RANKINGS:\n');
  console.log('Rank | Movie                                  | V2 Score | V3 Score | Change   | Pop');
  console.log('─'.repeat(100));
  updates.forEach((u, idx) => {
    const change = u.v3_score - u.v2_score;
    const changeStr = change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
    console.log(
      `${(idx + 1).toString().padStart(4)} | ${u.title.padEnd(38)} | ${u.v2_score.toFixed(1).padStart(8)} | ${u.v3_score.toFixed(1).padStart(8)} | ${changeStr.padStart(8)} | ${u.popularity.toFixed(1).padStart(3)}`
    );
  });

  console.log('\n');

  // Step 3: Update database
  console.log('💾 Step 3: Updating database...');

  const updateRecords = updates.map((u) => ({
    id: u.id,
    movie_id: u.movie_id,
    critic_score: u.critic_score,
    audience_score: u.audience_score,
    canon_score: u.canon_score,
    longevity_bonus: u.longevity_bonus,
    composite_score: u.v3_score,
  }));

  const { error: updateError } = await supabase.from('movie_scores').upsert(updateRecords);

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    process.exit(1);
  }

  console.log('✅ Database updated!\n');

  // Step 4: Verify
  console.log('🔍 Step 4: Verifying changes...');
  const { data: verified } = await supabase
    .from('movie_scores')
    .select('*, movies(title)')
    .order('composite_score', { ascending: false })
    .limit(5);

  if (verified) {
    console.log('\n✨ Top 5 Movies (v3 scores):');
    verified.forEach((v, idx) => {
      const movie = v.movies as any;
      console.log(`${idx + 1}. ${movie.title} - ${v.composite_score.toFixed(1)}`);
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log('✅ V3 SCORING APPLIED (FAST MODE)!');
  console.log('═'.repeat(100));
  console.log('\n📝 Summary:');
  console.log(`   - ${updates.length} movies recalculated`);
  console.log('   - Formula: Critic 35% + Audience 35% + Canon 15% + Longevity 5% + Popularity 5%');
  console.log('   - Popularity: Simulated based on movie age (test mode)');
  console.log('\n💡 To implement real Reddit crawling:');
  console.log('   - Run: npx tsx scripts/apply-v3-scoring.ts');
  console.log('   - Note: Reddit crawling is slow (2+ seconds per movie)');
  console.log('\n🚀 Next: Deploy to production (git commit & push)');
}

applyV3ScoringFast().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
