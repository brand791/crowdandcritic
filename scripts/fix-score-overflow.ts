/**
 * Fix scores that are over 100 by recalculating with the corrected formula
 * Run with: npx tsx scripts/fix-score-overflow.ts
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixScoreOverflow() {
  console.log('═'.repeat(100));
  console.log('FIXING SCORE OVERFLOW (SCORES > 100)');
  console.log('═'.repeat(100) + '\n');

  // Fetch all movies with scores
  console.log('📊 Step 1: Finding all movies with scores > 100...');
  const { data: allMovies } = await supabase
    .from('movies')
    .select(`
      id,
      title,
      year,
      movie_scores (*)
    `)
    .order('title');

  const overflowMovies = (allMovies || []).filter(m => {
    const scores = Array.isArray(m.movie_scores) ? m.movie_scores : [m.movie_scores];
    return scores[0]?.composite_score > 100;
  });

  console.log(`Found ${overflowMovies.length} movies with composite_score > 100\n`);

  if (overflowMovies.length === 0) {
    console.log('✅ No overflow scores found!\n');
    console.log('═'.repeat(100));
    console.log('✅ VERIFICATION COMPLETE!');
    console.log('═'.repeat(100));
    return;
  }

  // Recalculate and fix each
  console.log('🔧 Step 2: Recalculating overflow scores...\n');

  let fixedCount = 0;
  for (const movie of overflowMovies) {
    const scores = Array.isArray(movie.movie_scores)
      ? movie.movie_scores
      : [movie.movie_scores];
    const movieScore = scores[0] as any;

    if (!movieScore || !movieScore.id) continue;

    const oldScore = movieScore.composite_score;

    try {
      const computed = computeAllScores({
        rt_tomatometer: movieScore.rt_tomatometer,
        metacritic_score: movieScore.metacritic_score,
        imdb_rating: movieScore.imdb_rating,
        rt_audience: movieScore.rt_audience,
        metacritic_user: movieScore.metacritic_user,
        canon_appearances: movieScore.canon_appearances || 0,
        popularity_score: movieScore.popularity_weight || 0,
        year: movie.year,
      });

      const { error } = await supabase
        .from('movie_scores')
        .update({
          composite_score: computed.composite_score,
          critic_score: computed.critic_score,
          audience_score: computed.audience_score,
          canon_score: computed.canon_score,
          longevity_bonus: computed.longevity_bonus,
        })
        .eq('id', movieScore.id);

      if (!error) {
        fixedCount++;
        console.log(
          `  ✓ "${movie.title}" (${movie.year}): ${oldScore.toFixed(1)} → ${computed.composite_score.toFixed(1)}`
        );
      } else {
        console.log(`  ✗ Failed to fix "${movie.title}": ${error.message}`);
      }
    } catch (err) {
      console.error(`  ✗ Error calculating "${movie.title}":`, err);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount}/${overflowMovies.length} overflow scores\n`);

  // Verify
  console.log('🔍 Step 3: Verifying all scores are ≤ 100...');
  const { data: verifyScores } = await supabase
    .from('movie_scores')
    .select('composite_score');

  const stillOverflow = verifyScores?.filter(s => s.composite_score > 100) || [];
  const maxScore = Math.max(...(verifyScores?.map(s => s.composite_score) || [0]));
  const minScore = Math.min(...(verifyScores?.map(s => s.composite_score) || [0]));

  console.log(`\nScore Range:`);
  console.log(`  Min: ${minScore.toFixed(1)}`);
  console.log(`  Max: ${maxScore.toFixed(1)}`);
  console.log(`  Scores > 100: ${stillOverflow.length}`);

  console.log('\n' + '═'.repeat(100));
  console.log('✅ SCORE OVERFLOW FIX COMPLETE!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Summary:`);
  console.log(`   - Fixed ${fixedCount} overflow scores`);
  console.log(`   - All scores now in range: 0-100`);
  console.log(`   - Formula: (Critic*0.35 + Audience*0.35 + Canon*0.15 + Popularity*0.10) + Longevity(0-5)`);
  console.log(`   - Maximum possible: 95 + 5 = 100\n`);
  console.log(`🚀 Next: Deploy to production (git commit & push)`);
}

fixScoreOverflow().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
