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

  const subreddits = ['movies', 'TrueFilm', 'flicks'];
  let totalMentions = 0;
  let totalEngagement = 0;
  let topPostScore = 0;

  for (const subreddit of subreddits) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10sec timeout

      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?q=${searchQuery}&type=link&sort=relevance&limit=100&t=all`,
        {
          headers: {
            'User-Agent': 'CrowdAndCritic/1.0 (movie ranking aggregator)',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const data: RedditResponse = await response.json();

      if (data?.data?.children) {
        const posts = data.data.children.map((c) => c.data);

        // Count mentions and engagement
        totalMentions += posts.length;
        const engagement = posts.reduce((sum, post) => {
          // Engagement = upvotes + (comments * 0.5) — comments have value but less than upvotes
          return sum + (post.ups || 0) + (post.num_comments || 0) * 0.5;
        }, 0);
        totalEngagement += engagement;

        const maxScore = Math.max(...posts.map((p) => p.ups || 0));
        topPostScore = Math.max(topPostScore, maxScore);
      }

      // Respect rate limit (300ms between subreddit searches)
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      // Silently fail if Reddit search times out or errors
      continue;
    }
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
  console.log('FETCHING REAL POPULARITY FROM REDDIT');
  console.log('═'.repeat(100) + '\n');

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

  // Step 2: Search Reddit for each movie
  console.log('🔍 Step 2: Searching Reddit for popularity data...\n');

  const popularityData: PopularityData[] = [];

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i] as any;
    const progress = `[${i + 1}/${movies.length}]`;

    process.stdout.write(`\r${progress} Searching Reddit for "${movie.title}" (${movie.year})...`);

    try {
      const reddit = await searchReddit(movie.title, movie.year);

      if (reddit.mentions > 0) {
        const { score_0_to_5, score_0_to_100 } = convertToPopularityScore(
          reddit.mentions,
          reddit.totalEngagement,
          reddit.topPostScore
        );

        popularityData.push({
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

    // Respectful rate limiting
    if (i < movies.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✅ Found popularity data for ${popularityData.length}/${movies.length} movies\n`);

  // Step 3: Update database with popularity scores
  console.log('💾 Step 3: Updating database with real popularity scores...');

  let updateCount = 0;
  for (const pop of popularityData) {
    const { error: updateError } = await supabase
      .from('movie_scores')
      .update({ popularity_weight: pop.score_0_to_100 })
      .eq('id', (movies.find((m: any) => m.id === pop.movieId) as any)?.movie_scores?.id);

    if (!updateError) {
      updateCount++;
    }
  }

  console.log(`✅ Updated ${updateCount} movies with real popularity scores!\n`);

  // Step 4: Recalculate composite scores with real popularity
  console.log('🎯 Step 4: Recalculating composite scores with real popularity...');

  const scoresToUpdate = [];

  for (const movie of movies) {
    const movieData = movie as any;
    const popData = popularityData.find((p) => p.movieId === movieData.id);

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
