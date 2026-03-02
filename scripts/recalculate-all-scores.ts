/**
 * Recalculate all composite scores with corrected formula
 * Fixes: Canon score now included (15%), popularity no longer double-normalized, capped at 100
 * Run with: npx tsx scripts/recalculate-all-scores.ts
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

async function recalculateAllScores() {
  console.log('═'.repeat(100));
  console.log('RECALCULATING ALL COMPOSITE SCORES (CORRECTED FORMULA)');
  console.log('═'.repeat(100) + '\n');

  console.log('📊 Step 1: Fetching all movies with scores...');
  const { data: movies } = await supabase
    .from('movies')
    .select(`
      id,
      title,
      year,
      movie_scores (*)
    `)
    .order('title');

  if (!movies || movies.length === 0) {
    console.error('❌ No movies found');
    process.exit(1);
  }

  console.log(`✅ Found ${movies.length} movies\n`);

  console.log('🧮 Step 2: Recalculating composite scores with corrected formula...\n');
  console.log('Formula: (Critic*0.35 + Audience*0.35 + Canon*0.15 + Popularity*0.10) + Longevity (0-5 flat), capped at 100\n');

  let updateCount = 0;
  let maxScore = 0;
  let minScore = 100;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i] as any;
    const scores = Array.isArray(movie.movie_scores)
      ? movie.movie_scores
      : [movie.movie_scores];
    const movieScore = scores[0];

    if (!movieScore || !movieScore.id) {
      continue;
    }

    // Recalculate using corrected formula
    const computed = computeAllScores({
      rt_tomatometer: movieScore.rt_tomatometer,
      metacritic_score: movieScore.metacritic_score,
      imdb_rating: movieScore.imdb_rating,
      rt_audience: movieScore.rt_audience,
      metacritic_user: movieScore.metacritic_user,
      canon_appearances: movieScore.canon_appearances || 0,
      popularity_score: movieScore.popularity_weight || 0, // Now correctly 0-100 scale
      year: movie.year,
    });

    // Track min/max
    maxScore = Math.max(maxScore, computed.composite_score);
    minScore = Math.min(minScore, computed.composite_score);

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
      updateCount++;
    }

    if ((i + 1) % 50 === 0) {
      process.stdout.write(`\r  Progress: ${i + 1}/${movies.length}`);
    }
  }

  console.log(`\n\n✅ Updated ${updateCount} scores\n`);

  // Verify
  console.log('🔍 Step 3: Verifying corrected scores...');
  const { data: allScores } = await supabase
    .from('movie_scores')
    .select('composite_score');

  const overflowCount = allScores?.filter(s => s.composite_score > 100).length || 0;
  const nullCount = allScores?.filter(s => s.composite_score === null).length || 0;
  const avgScore = (allScores || []).reduce((sum, s) => sum + (s.composite_score || 0), 0) / ((allScores || []).length || 1) || 0;

  console.log(`\nScore Statistics:`);
  console.log(`  - Min composite score: ${minScore.toFixed(1)}`);
  console.log(`  - Max composite score: ${maxScore.toFixed(1)}`);
  console.log(`  - Average composite score: ${avgScore.toFixed(1)}`);
  console.log(`  - Scores over 100: ${overflowCount}`);
  console.log(`  - Null scores: ${nullCount}`);

  // Show top 10
  const { data: topMovies } = await supabase
    .from('movie_scores')
    .select('composite_score, movies(title, year)')
    .order('composite_score', { ascending: false })
    .limit(10);

  console.log(`\n✨ Top 10 Movies (with corrected scores):\n`);
  topMovies?.forEach((m, idx) => {
    const movie = m.movies as any;
    console.log(
      `${(idx + 1).toString().padStart(2)}. ${movie.title.substring(0, 45).padEnd(45)} (${movie.year}) - ${m.composite_score?.toFixed(1).padStart(5)}`
    );
  });

  console.log('\n' + '═'.repeat(100));
  console.log('✅ RECALCULATION COMPLETE!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Changes:`);
  console.log(`   - Canon Score now included (15% weight)`);
  console.log(`   - Popularity no longer double-normalized`);
  console.log(`   - All scores capped at 100 maximum`);
  console.log(`   - Updated ${updateCount} movie scores\n`);
  console.log(`🚀 Ready to deploy!`);
}

recalculateAllScores().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
