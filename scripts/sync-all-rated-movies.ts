/**
 * Sync all high-rated movies from TMDB/OMDB
 * This script finds movies with 7.0+ IMDb or 80%+ RT and adds missing ones
 * 
 * Run with: npx ts-node scripts/sync-all-rated-movies.ts
 * 
 * Note: Will consume OMDB API quota. Free tier = 1000/day
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

async function syncRatedMovies() {
  console.log('═'.repeat(100));
  console.log('SYNCING ALL HIGH-RATED MOVIES');
  console.log('═'.repeat(100) + '\n');

  // Get existing movie titles
  console.log('📊 Loading existing movies...');
  const { data: existingMovies } = await supabase
    .from('movies')
    .select('title, year');

  const existingSet = new Set(
    (existingMovies || []).map(m => `${m.title}|${m.year}`)
  );
  console.log(`✅ Found ${existingMovies?.length} existing movies\n`);

  // Fetch from TMDB top-rated
  console.log('🎬 Fetching top-rated movies from TMDB...');
  const tmdbMovies: TMDBMovie[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= 20; page++) {
    process.stdout.write(`  Page ${page}/20...\r`);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/top_rated?api_key=${tmdbApiKey}&page=${page}&language=en-US&region=US`
      );
      if (!response.ok) break;
      
      const data = await response.json();
      if (data.results) {
        data.results.forEach((movie: TMDBMovie) => {
          if (!seen.has(movie.id) && movie.vote_average >= 6.5) {
            tmdbMovies.push(movie);
            seen.add(movie.id);
          }
        });
      }
    } catch (err) {
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ Found ${tmdbMovies.length} candidates from TMDB\n`);

  // Check which are missing and add
  let addedCount = 0;
  let skippedCount = 0;

  console.log('📝 Checking and adding missing movies...\n');

  for (let i = 0; i < tmdbMovies.length; i++) {
    const tmdbMovie = tmdbMovies[i];
    const year = parseInt(tmdbMovie.release_date?.split('-')[0] || '0', 10);
    const key = `${tmdbMovie.title}|${year}`;

    if (existingSet.has(key)) {
      skippedCount++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${tmdbMovies.length}] ${tmdbMovie.title} (${year})...\r`);

    // Get OMDB data
    const omdbData = await getOMDBData(tmdbMovie.title, year);
    if (!omdbData || !omdbData.imdbRating) {
      skippedCount++;
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    const imdbRating = parseFloat(omdbData.imdbRating);
    const rtScore = omdbData.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
    const rtValue = rtScore ? parseInt(rtScore.Value) : null;

    // Only add if meets criteria
    if (imdbRating < 7.0 && (!rtValue || rtValue < 80)) {
      skippedCount++;
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    // Add to database
    const posterUrl = tmdbMovie.poster_path
      ? `https://image.tmdb.org/t/p/w342${tmdbMovie.poster_path}`
      : null;

    const { data: inserted, error: insertError } = await supabase
      .from('movies')
      .insert([{
        title: tmdbMovie.title,
        year,
        tmdb_id: tmdbMovie.id,
        poster_url: posterUrl,
      }])
      .select()
      .single();

    if (insertError) {
      skippedCount++;
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
        composite_score: compositeScore,
      }]);

    if (!scoreError) {
      addedCount++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\n✅ SYNC COMPLETE!`);
  console.log(`   Added: ${addedCount} new movies`);
  console.log(`   Skipped: ${skippedCount} (already exist or don't meet criteria)`);
  console.log(`\n📝 Note: OMDB free tier allows 1000 requests/day. This script used ${addedCount} requests.\n`);
}

syncRatedMovies().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
