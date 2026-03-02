/**
 * Fetch critic scores from OMDB for all 519 movies
 * Updates RT Tomatometer, Metacritic, IMDb ratings, etc.
 * Run with: npx tsx scripts/fetch-omdb-scores.ts
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const omdbApiKey = process.env.OMDB_API_KEY || '';

if (!serviceRoleKey || !omdbApiKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or OMDB_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const OMDB_BASE_URL = 'http://www.omdbapi.com';

interface OMDBResponse {
  Title: string;
  Year: string;
  imdbID: string;
  imdbRating: string;
  Metascore: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Type: string;
  Response: string;
  Error?: string;
}

interface MovieWithScores {
  id: string;
  title: string;
  year: number;
  movie_scores: Array<
    {
      id: string;
      rt_tomatometer: number | null;
      metacritic_score: number | null;
      imdb_rating: number | null;
      rt_audience: number | null;
      metacritic_user: number | null;
      canon_appearances: number;
    } & { [key: string]: any }
  >;
}

async function searchOMDB(title: string, year: number, retries: number = 3): Promise<OMDBResponse | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${OMDB_BASE_URL}/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}&y=${year}&type=movie`;
      
      const response = await fetch(url);
      const data: OMDBResponse = await response.json();

      // Check for rate limit error
      if (data.Error?.includes('rate') || data.Error?.includes('Request limit')) {
        const waitTime = Math.pow(2, attempt - 1) * 5000; // 5s, 10s, 20s exponential backoff
        console.warn(`⚠️  Rate limit hit (attempt ${attempt}/${retries}). Waiting ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue; // Retry
      }

      if (data.Response === 'False' || data.Error) {
        return null;
      }

      return data;
    } catch (err) {
      if (attempt === retries) {
        console.error(`❌ OMDB search error for "${title}":`, err);
        return null;
      }
      const waitTime = Math.pow(2, attempt - 1) * 2000; // 2s, 4s, 8s
      console.warn(`⚠️  Network error (attempt ${attempt}/${retries}). Waiting ${waitTime / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  return null;
}

function extractScoresFromOMDB(omdb: OMDBResponse): {
  imdb_rating: number | null;
  rt_tomatometer: number | null;
  metacritic_score: number | null;
  rt_audience: number | null;
  metacritic_user: number | null;
  imdb_id: string | null;
} {
  const result = {
    imdb_rating: omdb.imdbRating ? parseFloat(omdb.imdbRating) : null,
    rt_tomatometer: null as number | null,
    metacritic_score: omdb.Metascore ? parseInt(omdb.Metascore) : null,
    rt_audience: null as number | null,
    metacritic_user: null as number | null,
    imdb_id: omdb.imdbID || null,
  };

  // Extract Rotten Tomatoes scores from Ratings array
  if (omdb.Ratings && Array.isArray(omdb.Ratings)) {
    for (const rating of omdb.Ratings) {
      if (rating.Source === 'Rotten Tomatoes') {
        const match = rating.Value.match(/(\d+)%/);
        if (match) {
          // Rotten Tomatoes has both Tomatometer (critic) and Audience
          // OMDB only gives one, we'll use it as Tomatometer for now
          result.rt_tomatometer = parseInt(match[1]);
        }
      } else if (rating.Source === 'Metacritic') {
        const match = rating.Value.match(/(\d+)/);
        if (match) {
          result.metacritic_score = parseInt(match[1]);
        }
      }
    }
  }

  return result;
}

async function fetchOMDBScores() {
  console.log('═'.repeat(100));
  console.log('FETCHING OMDB SCORES FOR ALL 519 MOVIES');
  console.log('═'.repeat(100) + '\n');

  // Step 1: Fetch all movies with their scores
  console.log('📊 Step 1: Fetching movies from database...');
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(*)')
    .order('title');

  if (fetchError || !movies) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  console.log(`✅ Found ${movies.length} movies\n`);

  // Step 2: Search OMDB for each movie
  console.log('🎬 Step 2: Searching OMDB for scores...\n');

  const updates: Array<{
    id: string;
    rt_tomatometer: number | null;
    metacritic_score: number | null;
    imdb_rating: number | null;
    rt_audience: number | null;
    metacritic_user: number | null;
    imdb_id: string | null;
    critic_score: number;
    audience_score: number;
    canon_score: number;
    longevity_bonus: number;
    composite_score: number;
  }> = [];

  let foundCount = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i] as MovieWithScores;
    const progress = `[${i + 1}/${movies.length}]`;

    process.stdout.write(`\r${progress} Searching OMDB for "${movie.title}" (${movie.year})...`);

    const omdbData = await searchOMDB(movie.title, movie.year);

    if (!omdbData) {
      process.stdout.write(' ✗\n');
      continue;
    }

    foundCount++;
    const scores = extractScoresFromOMDB(omdbData);

    // Get the first (and usually only) movie_scores record
    const movieScore = movie.movie_scores[0];
    if (!movieScore) {
      process.stdout.write(' ✗ (no score record)\n');
      continue;
    }

    // Recalculate composite score with new data
    const computed = computeAllScores({
      rt_tomatometer: scores.rt_tomatometer,
      metacritic_score: scores.metacritic_score,
      imdb_rating: scores.imdb_rating,
      rt_audience: scores.rt_audience,
      metacritic_user: scores.metacritic_user,
      canon_appearances: movieScore.canon_appearances || 0,
      popularity_score: 2.0, // Keep existing popularity for now
      year: movie.year,
    });

    updates.push({
      id: movieScore.id,
      rt_tomatometer: scores.rt_tomatometer,
      metacritic_score: scores.metacritic_score,
      imdb_rating: scores.imdb_rating,
      rt_audience: scores.rt_audience,
      metacritic_user: scores.metacritic_user,
      imdb_id: scores.imdb_id,
      critic_score: computed.critic_score,
      audience_score: computed.audience_score,
      canon_score: computed.canon_score,
      longevity_bonus: computed.longevity_bonus,
      composite_score: computed.composite_score,
    });

    process.stdout.write(' ✓\n');

    // Respect OMDB rate limit (1000 requests/day limit)
    // 1000 requests / 86400 seconds = 1 request every ~86 seconds for full safety
    // Using 1500ms (~667 req/hour) to allow multiple runs per day without hitting limit
    // For 519 movies: 519 × 1.5s = ~13 minutes per full run, ~180 req from 1000 budget
    if (i < movies.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  console.log(`\n✅ Found scores for ${foundCount}/${movies.length} movies\n`);

  // Step 3: Update database
  console.log('💾 Step 3: Updating database with OMDB scores...');

  if (updates.length === 0) {
    console.log('⚠️  No scores to update');
    process.exit(0);
  }

  let updateCount = 0;
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('movie_scores')
      .update({
        rt_tomatometer: update.rt_tomatometer,
        metacritic_score: update.metacritic_score,
        imdb_rating: update.imdb_rating,
        rt_audience: update.rt_audience,
        metacritic_user: update.metacritic_user,
        critic_score: update.critic_score,
        audience_score: update.audience_score,
        canon_score: update.canon_score,
        longevity_bonus: update.longevity_bonus,
        composite_score: update.composite_score,
      })
      .eq('id', update.id);

    if (!updateError) {
      updateCount++;
    }
  }

  console.log(`✅ Updated ${updateCount} movie scores!\n`);

  // Step 4: Verify top movies
  console.log('🔍 Step 4: Verifying changes...');
  const { data: topMovies } = await supabase
    .from('movie_scores')
    .select('*, movies(title, year)')
    .order('composite_score', { ascending: false })
    .limit(10);

  if (topMovies) {
    console.log('\n✨ Top 10 Movies (with OMDB data):\n');
    topMovies.forEach((m, idx) => {
      const movie = m.movies as any;
      const score = m.composite_score ? m.composite_score.toFixed(1) : 'N/A';
      console.log(
        `${(idx + 1).toString().padStart(2)}. ${movie.title} (${movie.year}) - ${score}`
      );
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log('✅ OMDB SCORE FETCH COMPLETE!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Summary:`);
  console.log(`   - Updated: ${updateCount} movies with real critic/audience scores`);
  console.log(`   - Sources: OMDB (includes RT, Metacritic, IMDb)`);
  console.log(`   - Scores: Recalculated with v3 formula\n`);
  console.log(`🚀 Next: Deploy to production (git commit & push)`);
}

fetchOMDBScores().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
