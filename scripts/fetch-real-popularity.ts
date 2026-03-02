/**
 * Fetch real popularity scores from Reddit
 * Searches r/movies, r/TrueFilm, r/flicks for discussion volume + engagement
 * Converts to 0-5 scale based on upvotes and mention count
 * Run with: npx tsx scripts/fetch-real-popularity.ts
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

interface RedditPost {
  title: string;
  ups: number;
  downs: number;
  num_comments: number;
  created_utc: number;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

interface PopularityData {
  movieId: string;
  title: string;
  year: number;
  mentions: number;
  totalEngagement: number;
  topPostScore: number;
  score_0_to_5: number;
  score_0_to_100: number;
}

async function searchReddit(movieTitle: string, year: number): Promise<{
  mentions: number;
  totalEngagement: number;
  topPostScore: number;
}> {
  // Clean title for search
  const searchQuery = movieTitle
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '+')
    .substring(0, 100);

  let totalMentions = 0;
  let totalEngagement = 0;
  let topPostScore = 0;

  // Only search r/movies (the biggest subreddit)
  // This reduces API calls from 3 per movie to 1 per movie
  const subreddit = 'movies';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15sec timeout

    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/search.json?q=${searchQuery}&type=link&sort=relevance&limit=50&t=all`,
      {
        headers: {
          'User-Agent': 'CrowdAndCritic/1.0 (movie ranking aggregator)',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - wait longer
        console.warn(`⚠️  Rate limit hit on Reddit. Waiting 60 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
      return { mentions: 0, totalEngagement: 0, topPostScore: 0 };
    }

    const data: RedditResponse = await response.json();

    if (data?.data?.children) {
      const posts = data.data.children.map((c) => c.data);

      // Count mentions and engagement
      totalMentions = posts.length;
      totalEngagement = posts.reduce((sum, post) => {
        return sum + (post.ups || 0) + (post.num_comments || 0) * 0.5;
      }, 0);

      topPostScore = Math.max(...posts.map((p) => p.ups || 0), 0);
    }
  } catch (err) {
    // Silently fail if Reddit search times out or errors
    return { mentions: 0, totalEngagement: 0, topPostScore: 0 };
  }

  return {
    mentions: totalMentions,
    totalEngagement,
    topPostScore,
  };
}

function convertToPopularityScore(
  mentions: number,
  totalEngagement: number,
  topPostScore: number
): {
  score_0_to_5: number;
  score_0_to_100: number;
} {
  // Combine three signals into a single 0-100 score:
  // 1. Mention count (how many threads mention the movie)
  // 2. Total engagement (upvotes + comments)
  // 3. Top post score (peak interest)

  // Normalize each to 0-100
  const mentionScore = Math.min(mentions * 2, 100); // 50+ mentions = max
  const engagementScore = Math.min(totalEngagement / 100, 100); // 10k engagement = max
  const topPostScore_normalized = Math.min(topPostScore / 100, 100); // 10k upvotes = max

  // Weight them
  const composite_0_to_100 =
    mentionScore * 0.3 + // Breadth of discussion
    engagementScore * 0.5 + // Depth of discussion
    topPostScore_normalized * 0.2; // Peak interest

  // Convert to 0-5 scale
  const score_0_to_5 = (composite_0_to_100 / 100) * 5;

  return {
    score_0_to_5: Math.min(score_0_to_5, 5),
    score_0_to_100: composite_0_to_100,
  };
}

async function fetchRealPopularity() {
  console.log('═'.repeat(100));
  console.log('FETCHING REAL POPULARITY FROM REDDIT (BATCH MODE)');
  console.log('═'.repeat(100) + '\n');

  const BATCH_SIZE = 50; // Process 50 movies at a time

  // Step 1: Fetch all movies
  console.log('📊 Step 1: Fetching all movies...');
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(id, critic_score, audience_score, canon_score, canon_appearances, longevity_bonus)');

  if (fetchError || !movies) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  console.log(`✅ Found ${movies.length} movies\n`);

  // Step 2: Process in batches
  console.log(`🔍 Step 2: Searching Reddit for popularity data (${BATCH_SIZE} movies per batch)...\n`);

  const totalBatches = Math.ceil(movies.length / BATCH_SIZE);
  let totalPopularityData: PopularityData[] = [];

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const batchStart = batchNum * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, movies.length);
    const batchMovies = movies.slice(batchStart, batchEnd);

    console.log(`\n📦 BATCH ${batchNum + 1}/${totalBatches} (movies ${batchStart + 1}-${batchEnd})\n`);

    const batchData: PopularityData[] = [];

    for (let i = 0; i < batchMovies.length; i++) {
      const movie = batchMovies[i] as any;
      const globalIndex = batchStart + i;
      const progress = `[${globalIndex + 1}/${movies.length}]`;

      process.stdout.write(`\r${progress} Searching Reddit for "${movie.title}" (${movie.year})...`);

      try {
        const reddit = await searchReddit(movie.title, movie.year);

        if (reddit.mentions > 0) {
          const { score_0_to_5, score_0_to_100 } = convertToPopularityScore(
            reddit.mentions,
            reddit.totalEngagement,
            reddit.topPostScore
          );

          batchData.push({
            movieId: movie.id,
            title: movie.title,
            year: movie.year,
            mentions: reddit.mentions,
            totalEngagement: reddit.totalEngagement,
            topPostScore: reddit.topPostScore,
            score_0_to_5,
            score_0_to_100,
          });

          process.stdout.write(
            ` ✓ (${reddit.mentions} mentions, ${score_0_to_5.toFixed(2)}/5)\n`
          );
        } else {
          process.stdout.write(` — (no mentions)\n`);
        }
      } catch (err) {
        process.stdout.write(` ✗\n`);
      }

      // STRICT rate limiting: 2 second delay between movies
      // Reddit public API limit is ~60 requests/minute
      // At 2 seconds per request = 30 requests/minute (well under limit)
      if (i < batchMovies.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Save batch to database immediately
    console.log(`\n💾 Saving batch ${batchNum + 1}...`);
    if (batchData.length > 0) {
      for (const pop of batchData) {
        await supabase
          .from('movie_scores')
          .update({ popularity_weight: pop.score_0_to_100 })
          .eq('id', (movies.find((m: any) => m.id === pop.movieId) as any)?.movie_scores?.id);
      }
      totalPopularityData = totalPopularityData.concat(batchData);
    }
    console.log(`✅ Batch ${batchNum + 1} saved (${batchData.length} movies)\n`);

    // Wait between batches (reduce pressure on Reddit)
    if (batchNum < totalBatches - 1) {
      console.log(`⏸️  Waiting 30 seconds before next batch...\n`);
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }

  console.log(`\n✅ Found popularity data for ${totalPopularityData.length}/${movies.length} movies\n`);

  // Step 3: Recalculate composite scores with real popularity
  console.log('🎯 Step 3: Recalculating composite scores with real popularity...');

  const scoresToUpdate = [];

  for (const movie of movies) {
    const movieData = movie as any;
    const popData = totalPopularityData.find((p) => p.movieId === movieData.id);

    if (!popData) continue;

    const movieScores = movieData.movie_scores;
    
    // Recalculate with real popularity
    const computed = computeAllScores({
      rt_tomatometer: movieScores?.rt_tomatometer || null,
      metacritic_score: movieScores?.metacritic_score || null,
      imdb_rating: movieScores?.imdb_rating || null,
      rt_audience: movieScores?.rt_audience || null,
      metacritic_user: movieScores?.metacritic_user || null,
      canon_appearances: movieScores?.canon_appearances || 0,
      popularity_score: popData.score_0_to_5, // Use real score
      year: movieData.year,
    });

    scoresToUpdate.push({
      id: movieScores?.id,
      composite_score: computed.composite_score,
    });
  }

  // Update all scores
  console.log(`\n💾 Updating ${scoresToUpdate.length} composite scores...`);
  for (const score of scoresToUpdate) {
    await supabase
      .from('movie_scores')
      .update({ composite_score: score.composite_score })
      .eq('id', score.id);
  }

  console.log(`✅ Recalculated ${scoresToUpdate.length} composite scores!\n`);

  // Step 5: Verify
  console.log('🔍 Step 5: Verifying top movies with real popularity...');
  const { data: topMovies } = await supabase
    .from('movie_scores')
    .select('composite_score, movies(title, year)')
    .order('composite_score', { ascending: false })
    .limit(15);

  if (topMovies) {
    console.log('\n✨ Top 15 Movies (with Real Popularity):\n');
    topMovies.forEach((m, idx) => {
      const mov = m.movies as any;
      console.log(
        `${(idx + 1).toString().padStart(2)}. ${mov.title} (${mov.year}) - ${m.composite_score.toFixed(1)}`
      );
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log('✅ REAL POPULARITY FETCH COMPLETE!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Summary:`);
  console.log(`   - Found Reddit data for: ${popularityData.length}/${movies.length} movies`);
  console.log(`   - Recalculated: ${scoresToUpdate.length} composite scores`);
  console.log(`   - Source: Reddit (r/movies, r/TrueFilm, r/flicks)`);
  console.log(`   - Method: Mention count + engagement (upvotes + comments)\n`);
  console.log(`🚀 Next: Deploy to production (git commit & push)`);
}

fetchRealPopularity().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
