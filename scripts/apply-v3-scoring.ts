/**
 * Apply v3 scoring formula with Reddit popularity to all movies
 * Run with: npx tsx scripts/apply-v3-scoring.ts
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';
import { searchRedditBatch } from '../lib/reddit-crawler';
import { calculatePopularityScore } from '../lib/popularity';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyV3Scoring() {
  console.log('═'.repeat(100));
  console.log('APPLYING V3 SCORING: Reddit Popularity + Updated Formula');
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

  // Step 2: Crawl Reddit for popularity data
  console.log('📍 Step 2: Crawling Reddit for popularity data...\n');
  const titles = movies.map((m) => m.title);
  const redditData = await searchRedditBatch(titles, { verbose: false, delayMs: 1500 });

  console.log(`✅ Collected Reddit data for ${redditData.length} movies\n`);

  // Step 3: Calculate new composite scores
  console.log('🎯 Step 3: Recalculating composite scores with v3 formula...\n');

  const updates = movies
    .map((movie, idx) => {
      // Note: Supabase returns a single object, not an array
      const score = movie.movie_scores as any;
      if (!score || !score.id) return null; // Skip movies without scores

      const reddit = redditData[idx];
      const popularityScore = calculatePopularityScore(reddit.mentions, 0); // YouTube disabled for now

      const computed = computeAllScores({
        rt_tomatometer: score.rt_tomatometer,
        metacritic_score: score.metacritic_score,
        imdb_rating: score.imdb_rating,
        rt_audience: score.rt_audience,
        metacritic_user: score.metacritic_user,
        canon_appearances: score.canon_appearances || 0,
        popularity_score: popularityScore,
        year: movie.year,
      });

      return {
        id: score.id,
        movie_id: score.movie_id,
        title: movie.title,
        reddit_mentions: reddit.mentions,
        popularity_score: popularityScore,
        v3_composite: computed.composite_score,
        critic_score: computed.critic_score,
        audience_score: computed.audience_score,
        canon_score: computed.canon_score,
        longevity_bonus: computed.longevity_bonus,
      };
    })
    .filter((u): u is NonNullable<typeof u> => u !== null);

  // Sort by v3 composite score
  updates.sort((a, b) => b.v3_composite - a.v3_composite);

  // Display new rankings
  console.log('🏆 NEW V3 RANKINGS:\n');
  console.log('Rank | Movie                                  | V3 Score | Reddit | Pop');
  console.log('─'.repeat(100));
  updates.forEach((u, idx) => {
    console.log(
      `${(idx + 1).toString().padStart(4)} | ${u.title.padEnd(38)} | ${u.v3_composite.toFixed(1).padStart(8)} | ${u.reddit_mentions.toString().padStart(6)} | ${u.popularity_score.toFixed(1)}`
    );
  });

  console.log('\n');

  // Step 4: Update database
  console.log('💾 Step 4: Updating database...');

  const updateRecords = updates.map((u) => ({
    id: u.id,
    movie_id: u.movie_id,
    critic_score: u.critic_score,
    audience_score: u.audience_score,
    canon_score: u.canon_score,
    longevity_bonus: u.longevity_bonus,
    composite_score: u.v3_composite,
  }));

  const { error: updateError } = await supabase.from('movie_scores').upsert(updateRecords);

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    process.exit(1);
  }

  console.log('✅ Database updated!\n');

  // Step 5: Verify
  console.log('🔍 Step 5: Verifying changes...');
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
  console.log('✅ V3 SCORING APPLIED!');
  console.log('═'.repeat(100));
  console.log('\n📝 Summary:');
  console.log(`   - ${movies.length} movies recalculated`);
  console.log('   - Formula: Critic 35% + Audience 35% + Canon 15% + Longevity 5% + Popularity 5%');
  console.log('   - Popularity based on Reddit discussion volume');
  console.log('\n🚀 Next: Deploy to production (git commit & push)');
}

applyV3Scoring().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
