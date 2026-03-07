/**
 * Sync all IMDB Top 250 movies to the database
 * This ensures we have every movie from IMDB's top 250 list
 * 
 * Run with: npx ts-node scripts/sync-imdb-top-250.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const tmdbApiKey = process.env.TMDB_API_KEY || '';
const omdbApiKey = process.env.OMDB_API_KEY || '';

if (!tmdbApiKey || !omdbApiKey) {
  console.error('❌ Missing API keys');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'http://www.omdbapi.com';

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
}

async function searchTMDB(title: string, year: number): Promise<TMDBMovie | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&year=${year}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;
    return data.results[0];
  } catch {
    return null;
  }
}

async function getOMDBData(title: string, year: number) {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}&y=${year}&type=movie`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.Response === 'False') return null;
    return data;
  } catch {
    return null;
  }
}

async function syncIMDBTop250() {
  console.log('═'.repeat(100));
  console.log('SYNCING IMDB TOP 250 MOVIES');
  console.log('═'.repeat(100) + '\n');

  // Get IMDB Top 250 from TMDB (fetch all pages)
  console.log('🎬 Fetching IMDB Top 250 from TMDB...');
  let top250: TMDBMovie[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= 13; page++) {
    process.stdout.write(`  Page ${page}/13...\r`);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/top_rated?api_key=${tmdbApiKey}&language=en-US&page=${page}`
      );
      const data = await response.json();

      if (data.results) {
        data.results.forEach((movie: TMDBMovie) => {
          if (!seen.has(movie.id)) {
            top250.push(movie);
            seen.add(movie.id);
          }
        });
      }
    } catch (err) {
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ Found ${top250.length} movies from top-rated (which includes IMDB Top 250)\n`);

  // Get existing movies
  console.log('📊 Checking existing movies...');
  const { data: existingMovies } = await supabase
    .from('movies')
    .select('title, year');

  const existingSet = new Set(
    (existingMovies || []).map(m => `${m.title}|${m.year}`)
  );
  console.log(`✅ Found ${existingMovies?.length} existing movies\n`);

  // Find missing
  const missing: TMDBMovie[] = [];
  top250.forEach(movie => {
    const year = parseInt(movie.release_date?.split('-')[0] || '0', 10);
    const key = `${movie.title}|${year}`;
    if (!existingSet.has(key)) {
      missing.push(movie);
    }
  });

  console.log(`📥 Missing: ${missing.length} movies\n`);

  if (missing.length === 0) {
    console.log('✨ All IMDB Top 250 movies already in database!');
    process.exit(0);
  }

  // Add missing movies
  console.log('💾 Adding missing movies...\n');

  let addedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < missing.length; i++) {
    const movie = missing[i];
    const year = parseInt(movie.release_date?.split('-')[0] || '0', 10);
    const pct = ((i + 1) / missing.length * 100).toFixed(1);

    process.stdout.write(`[${pct}%] ${movie.title} (${year})...\r`);

    // Get OMDB data
    const omdbData = await getOMDBData(movie.title, year);
    if (!omdbData || !omdbData.imdbRating) {
      failedCount++;
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    const imdbRating = parseFloat(omdbData.imdbRating);
    const rtScore = omdbData.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
    const rtValue = rtScore ? parseInt(rtScore.Value) : null;
    const imdbVotes = omdbData.imdbVotes ? parseInt(omdbData.imdbVotes.replace(/,/g, ''), 10) : null;

    // Add to database
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
      : null;

    const { data: inserted, error: insertError } = await supabase
      .from('movies')
      .insert([{
        title: movie.title,
        year,
        tmdb_id: movie.id,
        poster_url: posterUrl,
      }])
      .select()
      .single();

    if (insertError) {
      failedCount++;
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    // Add scores
    const compositeScore = rtValue ? (rtValue * 0.5 + imdbRating * 5) / 5 : null;

    const { error: scoreError } = await supabase
      .from('movie_scores')
      .insert([{
        movie_id: inserted.id,
        imdb_rating: imdbRating,
        rt_tomatometer: rtValue,
        imdb_votes: imdbVotes,
        composite_score: compositeScore,
      }]);

    if (!scoreError) {
      addedCount++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\n✅ SYNC COMPLETE!`);
  console.log(`   Added: ${addedCount} IMDB Top 250 movies`);
  console.log(`   Failed: ${failedCount}`);
  console.log(`\n🎬 All IMDB Top 250 movies now in database!\n`);
}

syncIMDBTop250().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
