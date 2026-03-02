/**
 * Fetch movie posters from TMDB and update database
 * Run with: npx tsx scripts/fetch-tmdb-posters.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';
const tmdbApiKey = process.env.TMDB_API_KEY || '';

if (!tmdbApiKey) {
  console.error('❌ TMDB_API_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342';

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
}

async function searchTMDB(title: string, year: number, retries: number = 3): Promise<TMDBMovie | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&year=${year}`
      );

      // Check for rate limit (429 status code)
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt - 1) * 5000; // 5s, 10s, 20s exponential backoff
        console.warn(`⚠️  Rate limit hit (attempt ${attempt}/${retries}). Waiting ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue; // Retry
      }

      if (!response.ok) {
        if (attempt === retries) {
          console.warn(`⚠️  TMDB search failed for "${title}": ${response.status}`);
          return null;
        }
        const waitTime = Math.pow(2, attempt - 1) * 2000;
        console.warn(`⚠️  HTTP ${response.status} (attempt ${attempt}/${retries}). Waiting ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      const data: TMDBSearchResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        console.warn(`⚠️  No results found on TMDB for "${title}" (${year})`);
        return null;
      }

      // Return first result (should be the most relevant)
      return data.results[0];
    } catch (err) {
      if (attempt === retries) {
        console.error(`❌ Error searching TMDB for "${title}":`, err);
        return null;
      }
      const waitTime = Math.pow(2, attempt - 1) * 2000;
      console.warn(`⚠️  Network error (attempt ${attempt}/${retries}). Waiting ${waitTime / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  return null;
}

async function fetchPosters() {
  console.log('═'.repeat(100));
  console.log('FETCHING MOVIE POSTERS FROM TMDB');
  console.log('═'.repeat(100) + '\n');

  // Fetch all movies
  console.log('📊 Step 1: Fetching movies from database...');
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year')
    .order('title');

  if (fetchError || !movies) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  console.log(`✅ Found ${movies.length} movies\n`);

  // Search TMDB for each movie
  console.log('🎬 Step 2: Searching TMDB for posters...\n');

  const updates: Array<{ id: string; poster_url: string }> = [];

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    console.log(`[${i + 1}/${movies.length}] Searching for "${movie.title}" (${movie.year})...`);

    const tmdbMovie = await searchTMDB(movie.title, movie.year);

    if (tmdbMovie && tmdbMovie.poster_path) {
      const posterUrl = `${POSTER_BASE_URL}${tmdbMovie.poster_path}`;
      updates.push({
        id: movie.id,
        poster_url: posterUrl,
      });
      console.log(`  ✅ Found: ${posterUrl}`);
    } else {
      console.log(`  ⚠️  No poster found, keeping placeholder`);
    }

    // Respect TMDB rate limits (4 requests/sec, using 500ms for safety margin)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n');

  // Update database
  console.log('💾 Step 3: Updating database...');

  if (updates.length === 0) {
    console.log('⚠️  No posters to update');
    process.exit(0);
  }

  // Update each movie individually (safer than upsert with partial data)
  let updateCount = 0;
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('movies')
      .update({ poster_url: update.poster_url })
      .eq('id', update.id);

    if (updateError) {
      console.error(`❌ Failed to update ${update.id}:`, updateError);
    } else {
      updateCount++;
    }
  }

  if (updateCount === 0) {
    console.error('❌ No movies were updated');
    process.exit(1);
  }

  console.log(`✅ Database updated with ${updateCount} posters!\n`);

  // Verify
  console.log('🔍 Step 4: Verifying changes...');
  const { data: verified } = await supabase
    .from('movies')
    .select('title, poster_url')
    .not('poster_url', 'is', null)
    .limit(5);

  if (verified) {
    console.log(`\n✨ Sample of ${verified.length} movies with posters:`);
    verified.forEach((m) => {
      console.log(`  • ${m.title}: ${m.poster_url?.substring(0, 60)}...`);
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log('✅ POSTER FETCH COMPLETE!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Summary:`);
  console.log(`   - ${updates.length}/${movies.length} movies updated with posters`);
  console.log(`   - Source: TMDB (themoviedb.org)`);
  console.log(`   - Poster size: 342px width (mobile-friendly)`);
  console.log(`\n🚀 Next: Deploy to production (git commit & push)`);
}

fetchPosters().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
