/**
 * Fix data quality issues:
 * 1. Remove duplicate movies (keep one per title/year, delete others)
 * 2. Recalculate null composite scores
 * Run with: npx tsx scripts/fix-data-quality.ts
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

async function fixDataQuality() {
  console.log('═'.repeat(100));
  console.log('FIXING DATA QUALITY ISSUES');
  console.log('═'.repeat(100) + '\n');

  // Step 1: Find and remove duplicates
  console.log('🔍 Step 1: Finding duplicate movies (same title + year)...');
  const { data: allMovies } = await supabase
    .from('movies')
    .select('id, title, year')
    .order('title');

  const titleYearMap: Record<string, string[]> = {};
  const duplicates: Record<string, string[]> = {};

  allMovies?.forEach(m => {
    const key = `${m.title}|${m.year}`;
    if (!titleYearMap[key]) {
      titleYearMap[key] = [];
    }
    titleYearMap[key].push(m.id);
  });

  // Find entries with multiple IDs
  Object.entries(titleYearMap).forEach(([key, ids]) => {
    if (ids.length > 1) {
      duplicates[key] = ids;
    }
  });

  const dupCount = Object.keys(duplicates).length;
  console.log(`Found ${dupCount} duplicates\n`);

  if (dupCount > 0) {
    console.log('Removing duplicates (keeping first, deleting others)...\n');
    
    let deletedCount = 0;
    for (const [key, ids] of Object.entries(duplicates)) {
      const keepId = ids[0];
      const deleteIds = ids.slice(1);

      for (const deleteId of deleteIds) {
        // Delete the duplicate movie and its scores
        await supabase.from('movie_scores').delete().eq('movie_id', deleteId);
        await supabase.from('canon_lists').delete().eq('movie_id', deleteId);
        const { error } = await supabase.from('movies').delete().eq('id', deleteId);

        if (!error) {
          deletedCount++;
          console.log(`  ✓ Deleted duplicate: "${key}" (${deleteId})`);
        } else {
          console.log(`  ✗ Failed to delete ${deleteId}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Deleted ${deletedCount} duplicate records\n`);
  }

  // Step 2: Fix null composite scores
  console.log('📊 Step 2: Fixing null composite scores...');
  const { data: moviesWithScores } = await supabase
    .from('movies')
    .select(`
      id,
      title,
      year,
      movie_scores (*)
    `)
    .order('title');

  const nullScoreMovies = (moviesWithScores || []).filter(m => {
    const scores = Array.isArray(m.movie_scores) ? m.movie_scores : [m.movie_scores];
    return scores[0]?.composite_score === null || scores[0]?.composite_score === undefined;
  });

  console.log(`Found ${nullScoreMovies.length} movies with null composite scores\n`);

  let fixedCount = 0;
  if (nullScoreMovies.length > 0) {
    console.log('Recalculating composite scores...\n');
    for (const movie of nullScoreMovies) {
      const scores = Array.isArray(movie.movie_scores)
        ? movie.movie_scores
        : [movie.movie_scores];
      const movieScore = scores[0] as any;

      if (!movieScore || !movieScore.id) continue;

      try {
        const computed = computeAllScores({
          rt_tomatometer: movieScore.rt_tomatometer,
          metacritic_score: movieScore.metacritic_score,
          imdb_rating: movieScore.imdb_rating,
          rt_audience: movieScore.rt_audience,
          metacritic_user: movieScore.metacritic_user,
          canon_appearances: movieScore.canon_appearances || 0,
          popularity_score: movieScore.popularity_weight || 2.0,
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
          process.stdout.write(`\r  ✓ Fixed ${fixedCount}/${nullScoreMovies.length}`);
        }
      } catch (err) {
        console.error(`\n  ✗ Error fixing "${movie.title}":`, err);
      }
    }

    console.log(`\n\n✅ Fixed ${fixedCount} composite scores\n`);
  }

  // Step 3: Verify
  console.log('🔍 Step 3: Verifying fixes...');
  const { data: finalMovies } = await supabase
    .from('movies')
    .select('id');

  const { data: finalScores } = await supabase
    .from('movie_scores')
    .select('composite_score');

  const nullCount = finalScores?.filter(s => s.composite_score === null).length || 0;

  console.log(`\nFinal counts:`);
  console.log(`  - Total movies: ${finalMovies?.length || 0}`);
  console.log(`  - Total scores: ${finalScores?.length || 0}`);
  console.log(`  - Null scores remaining: ${nullCount}`);

  console.log('\n' + '═'.repeat(100));
  console.log('✅ DATA QUALITY FIX COMPLETE!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Summary:`);
  console.log(`   - Removed ${dupCount} duplicate movies (deleted ${dupCount} extra records)`);
  console.log(`   - Fixed ${fixedCount || 0} null composite scores`);
  console.log(`   - Database now has ${finalMovies?.length} unique movies\n`);
  console.log(`🚀 Next: Deploy to production (git commit & push)`);
}

fixDataQuality().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
