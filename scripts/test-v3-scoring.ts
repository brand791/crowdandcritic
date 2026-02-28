/**
 * Test v3 scoring formula with Reddit + YouTube popularity data
 * Run with: npx tsx scripts/test-v3-scoring.ts
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';
import { searchRedditBatch } from '../lib/reddit-crawler';
import { searchYouTubeBatch } from '../lib/youtube-crawler';
import {
  calculatePopularityScore,
  formatPopularityDebug,
} from '../lib/popularity';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testV3Scoring() {
  console.log('═'.repeat(100));
  console.log('V3 SCORING TEST: Reddit + YouTube Popularity');
  console.log('═'.repeat(100) + '\n');

  // Fetch current movies and scores
  console.log('🎬 Fetching seeded movies...\n');
  const { data: movies, error } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(*)')
    .order('title')
    .limit(20);

  if (error || !movies) {
    console.error('❌ Error fetching movies:', error);
    process.exit(1);
  }

  const titles = movies.map((m) => m.title);
  console.log(`📊 Found ${titles.length} movies\n`);

  // Step 1: Collect Reddit data
  console.log('📍 Step 1: Collecting Reddit data...\n');
  const redditData = await searchRedditBatch(titles, { verbose: true, delayMs: 1500 });
  console.log('');

  // Step 2: Collect YouTube data
  console.log('📺 Step 2: Collecting YouTube data...\n');
  const youtubeData = await searchYouTubeBatch(titles, undefined, { verbose: true });
  console.log('');

  // Step 3: Calculate popularity scores
  console.log('🎯 Step 3: Computing popularity scores...\n');
  const popularityScores = titles.map((title, idx) => {
    const reddit = redditData[idx];
    const youtube = youtubeData[idx];
    const score = calculatePopularityScore(reddit.mentions, youtube.trailerViews);

    return {
      title,
      reddit_mentions: reddit.mentions,
      youtube_views: youtube.trailerViews,
      popularity_score: score,
    };
  });

  popularityScores.forEach((p) => {
    console.log(formatPopularityDebug({
      movie_id: '',
      title: p.title,
      reddit_mentions: p.reddit_mentions,
      reddit_score: (p.reddit_mentions === 0 ? 0 : Math.log(p.reddit_mentions + 1) / Math.log(10000) * 5),
      youtube_views: p.youtube_views,
      youtube_score: (p.youtube_views === 0 ? 0 : Math.log(p.youtube_views + 1) / Math.log(100000000) * 5),
      popularity_score: p.popularity_score,
    }));
    console.log('');
  });

  // Step 4: Recalculate composite scores with v3 formula
  console.log('═'.repeat(100));
  console.log('COMPOSITE SCORE COMPARISON (v2 vs v3)');
  console.log('═'.repeat(100) + '\n');

  const comparisons = movies.map((movie, idx) => {
    const score = movie.movie_scores[0];
    const v2Score = score?.composite_score ?? 0;

    // Recalculate with v3 formula including popularity
    const v3Computed = computeAllScores({
      rt_tomatometer: score?.rt_tomatometer,
      metacritic_score: score?.metacritic_score,
      imdb_rating: score?.imdb_rating,
      rt_audience: score?.rt_audience,
      metacritic_user: score?.metacritic_user,
      canon_appearances: score?.canon_appearances || 0,
      popularity_score: popularityScores[idx].popularity_score,
      year: movie.year,
    });

    const v3Score = v3Computed.composite_score;
    const change = v3Score - v2Score;

    return {
      title: movie.title,
      year: movie.year,
      v2Score,
      v3Score,
      change,
      popularity: popularityScores[idx].popularity_score,
    };
  });

  // Sort by v3 score descending
  comparisons.sort((a, b) => b.v3Score - a.v3Score);

  console.log('Rank | Movie                                  | Year | V2 Score | V3 Score | Change | Pop');
  console.log('─'.repeat(100));

  comparisons.forEach((c, idx) => {
    const changeStr = c.change >= 0 ? `+${c.change.toFixed(1)}` : c.change.toFixed(1);
    console.log(
      `${(idx + 1).toString().padStart(4)} | ${c.title.padEnd(38)} | ${c.year} | ${c.v2Score.toFixed(1).padStart(8)} | ${c.v3Score.toFixed(1).padStart(8)} | ${changeStr.padStart(6)} | ${c.popularity.toFixed(1)}`
    );
  });

  console.log('\n' + '═'.repeat(100));
  console.log('SUMMARY\n');

  const avgV2 = comparisons.reduce((sum, c) => sum + c.v2Score, 0) / comparisons.length;
  const avgV3 = comparisons.reduce((sum, c) => sum + c.v3Score, 0) / comparisons.length;
  const totalChange = comparisons.reduce((sum, c) => sum + c.change, 0);

  console.log(`Average v2 Score: ${avgV2.toFixed(1)}`);
  console.log(`Average v3 Score: ${avgV3.toFixed(1)}`);
  console.log(`Total Change: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)}\n`);

  console.log('✅ Test complete! Ready to apply v3 scoring to database.');
  console.log(
    '💡 Next step: Run scripts/apply-v3-scoring.ts to update all movie scores.'
  );
}

testV3Scoring().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
