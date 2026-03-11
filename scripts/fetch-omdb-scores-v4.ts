import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const omdbKey = process.env.OMDB_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const OMDB_API_URL = 'https://www.omdbapi.com/';
const DELAY_MS = 1500; // Safe rate limit for OMDB free tier

interface OmdbResponse {
  Title: string;
  Year: string;
  imdbRating: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Response: string;
  Error?: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  maxRetries = 3
): Promise<OmdbResponse | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      const data = (await response.json()) as OmdbResponse;

      if (data.Response === 'False') {
        return null;
      }

      return data;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries} attempts:`, error);
        return null;
      }

      const backoffMs = Math.pow(2, attempt - 1) * 5000;
      console.log(
        `Attempt ${attempt} failed. Retrying in ${backoffMs}ms...`
      );
      await delay(backoffMs);
    }
  }

  return null;
}

function extractScores(omdbData: OmdbResponse): {
  imdb: number | null;
  rottenTomatoes: number | null;
} {
  // IMDb: Convert from 0-10 to 0-100 scale
  const imdb =
    omdbData.imdbRating && omdbData.imdbRating !== 'N/A'
      ? parseFloat(omdbData.imdbRating) * 10
      : null;

  // Rotten Tomatoes: Extract percentage
  let rottenTomatoes: number | null = null;
  if (omdbData.Ratings) {
    const rtRating = omdbData.Ratings.find(
      r => r.Source === 'Rotten Tomatoes'
    );
    if (rtRating && rtRating.Value) {
      rottenTomatoes = parseInt(rtRating.Value, 10);
    }
  }

  return { imdb, rottenTomatoes };
}

async function fetchAndUpdateScores(): Promise<void> {
  console.log('🎬 Fetching OMDB scores for v4 (RT + IMDb)...\n');

  // Get all movies
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year')
    .order('created_at', { ascending: false });

  if (fetchError || !movies) {
    console.error('Error fetching movies:', fetchError);
    return;
  }

  console.log(`Found ${movies.length} movies to update\n`);

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const progress = `[${i + 1}/${movies.length}]`;

    // Build OMDB query
    const query = new URLSearchParams({
      apikey: omdbKey,
      t: movie.title,
      ...(movie.year && { y: movie.year.toString() }),
      type: 'movie',
    });

    const url = `${OMDB_API_URL}?${query}`;

    try {
      const omdbData = await fetchWithRetry(url);

      if (!omdbData) {
        console.log(`${progress} ⚠️  ${movie.title} - No OMDB data found`);
        skippedCount++;
        await delay(DELAY_MS);
        continue;
      }

      const { imdb, rottenTomatoes } = extractScores(omdbData);

      // Option B: Skip if either score is missing
      if (imdb === null || rottenTomatoes === null) {
        console.log(
          `${progress} ⏭️  ${movie.title} - Missing score (RT: ${rottenTomatoes}, IMDb: ${imdb})`
        );
        skippedCount++;
        await delay(DELAY_MS);
        continue;
      }

      // Update database with correct column names
      const { error: updateError } = await supabase
        .from('movie_scores')
        .upsert(
          {
            movie_id: movie.id,
            imdb_rating: imdb,
            rt_tomatometer: rottenTomatoes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'movie_id' }
        );

      if (updateError) {
        console.log(
          `${progress} ❌ ${movie.title} - Update failed: ${updateError.message}`
        );
        skippedCount++;
      } else {
        console.log(
          `${progress} ✅ ${movie.title} - RT: ${rottenTomatoes}, IMDb: ${imdb.toFixed(1)}`
        );
        successCount++;
      }

      await delay(DELAY_MS);
    } catch (error) {
      console.log(`${progress} ❌ ${movie.title} - Error: ${error}`);
      skippedCount++;
      await delay(DELAY_MS);
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Updated: ${successCount} movies`);
  console.log(`   Skipped: ${skippedCount} movies (missing scores)`);
  console.log(`   Success rate: ${((successCount / movies.length) * 100).toFixed(1)}%`);
}

fetchAndUpdateScores().catch(console.error);
