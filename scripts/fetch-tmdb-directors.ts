/**
 * Fetch movie director information from TMDB and update database
 * Run with: npx ts-node scripts/fetch-tmdb-directors.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const tmdbApiKey = process.env.TMDB_API_KEY || '';

if (!tmdbApiKey) {
  console.error('❌ TMDB_API_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  credits: {
    crew: Array<{
      job: string;
      name: string;
      id: number;
    }>;
  };
}

async function searchTMDB(title: string, year: number, retries: number = 3): Promise<number | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&year=${year}`
      );

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt - 1) * 5000;
        console.warn(`  ⚠️  Rate limit (attempt ${attempt}/${retries}). Waiting ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        if (attempt === retries) {
          return null;
        }
        const waitTime = Math.pow(2, attempt - 1) * 2000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      const data: TMDBSearchResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      return data.results[0].id; // Return TMDB ID
    } catch (err) {
      if (attempt === retries) {
        console.error(`  ❌ Error searching TMDB:`, err);
        return null;
      }
      const waitTime = Math.pow(2, attempt - 1) * 2000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  return null;
}

async function getDirector(tmdbId: number, retries: number = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${tmdbApiKey}&append_to_response=credits`
      );

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt - 1) * 5000;
        console.warn(`  ⚠️  Rate limit (attempt ${attempt}/${retries}). Waiting ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        if (attempt === retries) {
          return null;
        }
        const waitTime = Math.pow(2, attempt - 1) * 2000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      const data: TMDBMovieDetails = await response.json();

      if (!data.credits || !data.credits.crew) {
        return null;
      }

      // Find the director in the crew list
      const director = data.credits.crew.find((member) => member.job === 'Director');

      return director ? director.name : null;
    } catch (err) {
      if (attempt === retries) {
        console.error(`  ❌ Error fetching details:`, err);
        return null;
      }
      const waitTime = Math.pow(2, attempt - 1) * 2000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  return null;
}

async function fetchDirectors() {
  console.log('═'.repeat(100));
  console.log('FETCHING MOVIE DIRECTORS FROM TMDB');
  console.log('═'.repeat(100) + '\n');

  // Fetch all movies without directors
  console.log('📊 Step 1: Fetching movies without directors from database...');
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year, tmdb_id')
    .or('director.is.null,director.eq.')
    .order('year', { ascending: false })
    .limit(1000); // Reasonable batch size

  if (fetchError || !movies) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  console.log(`✅ Found ${movies.length} movies without director data\n`);

  if (movies.length === 0) {
    console.log('✨ All movies already have director information!');
    process.exit(0);
  }

  // Fetch director info for each movie
  console.log('🎬 Step 2: Fetching directors from TMDB...\n');

  const updates: Array<{ id: string; director: string }> = [];
  let searchCount = 0;
  let detailsCount = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    console.log(`[${i + 1}/${movies.length}] "${movie.title}" (${movie.year})`);

    let tmdbId = movie.tmdb_id;

    // If no TMDB ID, search for it
    if (!tmdbId) {
      console.log(`  🔍 Searching TMDB for ID...`);
      tmdbId = await searchTMDB(movie.title, movie.year);
      searchCount++;
    }

    if (!tmdbId) {
      console.log(`  ⚠️  No TMDB ID found, skipping`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limit respect
      continue;
    }

    // Get director from TMDB
    console.log(`  📋 Fetching details (TMDB ID: ${tmdbId})...`);
    const director = await getDirector(tmdbId);
    detailsCount++;

    if (director) {
      updates.push({
        id: movie.id,
        director,
      });
      console.log(`  ✅ Director: ${director}`);
    } else {
      console.log(`  ⚠️  No director found`);
    }

    // Respect TMDB rate limits (4 requests/sec, using 500ms for safety)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n');

  // Update database
  console.log('💾 Step 3: Updating database...');

  if (updates.length === 0) {
    console.log('⚠️  No directors to update');
    process.exit(0);
  }

  // Update each movie individually
  let updateCount = 0;
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('movies')
      .update({ director: update.director })
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

  console.log(`✅ Database updated with ${updateCount} directors!\n`);

  // Verify
  console.log('🔍 Step 4: Verifying changes...');
  const { data: verified } = await supabase
    .from('movies')
    .select('title, director')
    .not('director', 'is', null)
    .limit(10);

  if (verified) {
    console.log(`\n✨ Sample of movies with directors:`);
    verified.forEach((m) => {
      console.log(`  • ${m.title}: ${m.director}`);
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log('✅ DIRECTOR FETCH COMPLETE!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Summary:`);
  console.log(`   - ${updates.length} movies updated with director information`);
  console.log(`   - ${searchCount} TMDB searches performed`);
  console.log(`   - ${detailsCount} detail lookups performed`);
  console.log(`   - Source: TMDB (themoviedb.org)`);
  console.log(`\n🚀 Next: Deploy to production (git commit & push)`);
}

fetchDirectors().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
