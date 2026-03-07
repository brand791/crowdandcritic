import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const omdbApiKey = process.env.OMDB_API_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const OMDB_BASE_URL = 'http://www.omdbapi.com';

// List of well-known movies we should have that might be missing
const MUST_HAVES = [
  { title: 'The Aviator', year: 2004 },
  { title: 'A Beautiful Mind', year: 2001 },
  { title: 'There Will Be Blood', year: 2007 },
  { title: 'The Prestige', year: 2006 },
  { title: 'Se7en', year: 1995 },
  { title: 'Requiem for a Dream', year: 2000 },
  { title: 'Synecdoche, New York', year: 2008 },
  { title: 'Before Sunrise', year: 1995 },
  { title: 'Before Sunset', year: 2004 },
  { title: 'Before Midnight', year: 2013 },
  { title: 'Burn After Reading', year: 2008 },
  { title: 'No Country for Old Men', year: 2007 },
  { title: 'There Will Be Blood', year: 2007 },
];

async function getOMDBData(title: string, year: number) {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}&y=${year}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.Response === 'False') return null;
    return data;
  } catch {
    return null;
  }
}

async function addMissingMovies() {
  console.log('Checking for missing classic movies...\n');

  for (const movie of MUST_HAVES) {
    // Check if exists
    const { data: existing } = await supabase
      .from('movies')
      .select('id')
      .eq('title', movie.title)
      .eq('year', movie.year)
      .single();

    if (existing) {
      console.log(`✅ ${movie.title} (${movie.year}) - already in DB`);
      continue;
    }

    console.log(`📥 Adding ${movie.title} (${movie.year})...`);

    // Get OMDB data
    const omdbData = await getOMDBData(movie.title, movie.year);
    if (!omdbData) {
      console.log(`   ⚠️  Could not find on OMDB`);
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    const imdbRating = parseFloat(omdbData.imdbRating);
    if (imdbRating < 7.0) {
      console.log(`   ⚠️  IMDb ${imdbRating} (below 7.0 threshold)`);
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    // Get TMDB data for poster
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
    let tmdbId = null;
    let posterUrl = null;
    
    try {
      const tmdbResp = await fetch(tmdbUrl);
      const tmdbData = await tmdbResp.json();
      if (tmdbData.results?.[0]) {
        tmdbId = tmdbData.results[0].id;
        if (tmdbData.results[0].poster_path) {
          posterUrl = `https://image.tmdb.org/t/p/w342${tmdbData.results[0].poster_path}`;
        }
      }
    } catch {}

    // Extract RT score
    const rtScore = omdbData.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
    const rtValue = rtScore ? parseInt(rtScore.Value) : null;
    const compositeScore = rtValue ? (rtValue * 0.5 + imdbRating * 5) / 5 : null;

    // Insert movie
    const { data: inserted, error: insertError } = await supabase
      .from('movies')
      .insert([{
        title: movie.title,
        year: movie.year,
        tmdb_id: tmdbId,
        poster_url: posterUrl,
      }])
      .select()
      .single();

    if (insertError || !inserted) {
      console.log(`   ❌ Error: ${insertError?.message}`);
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    // Add scores
    const { error: scoreError } = await supabase
      .from('movie_scores')
      .insert([{
        movie_id: inserted.id,
        imdb_rating: imdbRating,
        rt_tomatometer: rtValue,
        composite_score: compositeScore,
      }]);

    if (scoreError) {
      console.log(`   ❌ Score error: ${scoreError.message}`);
    } else {
      console.log(`   ✅ Added (IMDb: ${imdbRating}, RT: ${rtValue || 'N/A'}%)`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n✅ Done!');
}

addMissingMovies();
