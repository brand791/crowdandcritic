/**
 * Fetch movie director information from TMDB - v2 (faster)
 * Batches updates and has better error handling
 * Run with: npx ts-node scripts/fetch-tmdb-directors-v2.ts
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

interface TMDBSearchResponse {
  results: Array<{ id: number; title: string; release_date: string }>;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  credits?: {
    crew: Array<{ job: string; name: string; id: number }>;
  };
}

async function searchTMDB(title: string, year: number): Promise<number | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&year=${year}`
    );

    if (response.status === 429) {
      console.log('  ⚠️  Rate limit, retrying in 5s...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return searchTMDB(title, year); // Recursive retry
    }

    if (!response.ok) return null;

    const data: TMDBSearchResponse = await response.json();
    return data.results?.[0]?.id || null;
  } catch (err) {
    return null;
  }
}

async function getDirector(tmdbId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${tmdbApiKey}&append_to_response=credits`
    );

    if (response.status === 429) {
      console.log('  ⚠️  Rate limit, retrying in 5s...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return getDirector(tmdbId); // Recursive retry
    }

    if (!response.ok) return null;

    const data: TMDBMovieDetails = await response.json();
    const director = data.credits?.crew?.find((m) => m.job === 'Director');
    return director?.name || null;
  } catch (err) {
    return null;
  }
}

async function fetchDirectors() {
  console.log('═'.repeat(100));
  console.log('FETCHING MOVIE DIRECTORS FROM TMDB - v2');
  console.log('═'.repeat(100) + '\n');

  // Get all movies without directors
  console.log('📊 Fetching movies without directors...');
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year, tmdb_id')
    .or('director.is.null,director.eq.')
    .order('year', { ascending: false });

  if (fetchError || !movies) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  console.log(`✅ Found ${movies.length} movies without director data\n`);

  if (movies.length === 0) {
    console.log('✨ All movies already have director information!');
    process.exit(0);
  }

  // Fetch directors
  console.log('🎬 Fetching directors...\n');

  const updates: Array<{ id: string; director: string }> = [];
  let processed = 0;
  let found = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const pct = ((i + 1) / movies.length * 100).toFixed(1);
    process.stdout.write(`\r[${pct}%] ${movie.title} (${movie.year})`);

    let tmdbId = movie.tmdb_id;

    // If no TMDB ID, search for it
    if (!tmdbId) {
      tmdbId = await searchTMDB(movie.title, movie.year);
    }

    if (!tmdbId) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      processed++;
      continue;
    }

    // Get director
    const director = await getDirector(tmdbId);

    if (director) {
      updates.push({ id: movie.id, director });
      found++;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    processed++;
  }

  console.log(`\n\n✅ Processed ${processed} movies, found ${found} directors\n`);

  // Update database in batches
  if (updates.length === 0) {
    console.log('⚠️  No directors to update');
    process.exit(0);
  }

  console.log('💾 Updating database...');

  let updateCount = 0;
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    const { error: updateError } = await supabase
      .from('movies')
      .update({ director: update.director })
      .eq('id', update.id);

    if (!updateError) {
      updateCount++;
    }

    // Show progress every 50 updates
    if ((i + 1) % 50 === 0) {
      process.stdout.write(`\r  ${i + 1}/${updates.length} updated`);
    }
  }

  console.log(`\n✅ Updated ${updateCount} movies with director information!\n`);

  // Verify
  const { data: verified } = await supabase
    .from('movies')
    .select('title, director')
    .not('director', 'is', null)
    .limit(10);

  if (verified && verified.length > 0) {
    console.log('✨ Sample of movies with directors:');
    verified.forEach((m: any) => {
      console.log(`  • ${m.title}: ${m.director}`);
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log('✅ DIRECTOR FETCH COMPLETE!');
  console.log('═'.repeat(100));
}

fetchDirectors().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
