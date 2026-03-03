import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const tmdbKey = process.env.TMDB_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const TMDB_API = 'https://api.themoviedb.org/3';
const DELAY_MS = 500; // TMDB: 40 requests per 10 seconds = 250ms min

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTmdbMovies(endpoint: string): Promise<any[]> {
  console.log(`Fetching from ${endpoint}...`);
  let allMovies: any[] = [];

  try {
    for (let page = 1; page <= 5; page++) {
      const url = `${TMDB_API}${endpoint}?api_key=${tmdbKey}&page=${page}&language=en-US`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        allMovies = allMovies.concat(data.results);
        console.log(`  Page ${page}: +${data.results.length} movies`);
      }

      await delay(DELAY_MS);
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
  }

  return allMovies;
}

async function getExistingIds(): Promise<Set<string>> {
  const { data } = await supabase.from('movies').select('title, year');
  const existing = new Set<string>();

  if (data) {
    data.forEach(m => {
      existing.add(`${m.title}|${m.year}`);
    });
  }

  return existing;
}

async function addMoviesToDb(movies: any[]): Promise<number> {
  const existingIds = await getExistingIds();
  let addedCount = 0;

  for (const tmdbMovie of movies) {
    if (!tmdbMovie.title || !tmdbMovie.release_date) continue;

    const year = parseInt(tmdbMovie.release_date.split('-')[0]);
    const key = `${tmdbMovie.title}|${year}`;

    if (existingIds.has(key)) {
      continue; // Skip if already exists
    }

    try {
      const { error } = await supabase.from('movies').insert({
        title: tmdbMovie.title,
        year,
        tmdb_id: tmdbMovie.id,
        poster_url: tmdbMovie.poster_path
          ? `https://image.tmdb.org/t/p/w342${tmdbMovie.poster_path}`
          : null,
        genres: tmdbMovie.genre_ids || [],
        plot: tmdbMovie.overview || null,
      });

      if (!error) {
        addedCount++;
        if (addedCount % 50 === 0) {
          console.log(`  Added ${addedCount} movies so far...`);
        }
      }
    } catch (error) {
      console.error(`Error adding ${tmdbMovie.title}:`, error);
    }
  }

  return addedCount;
}

async function expandSeed() {
  console.log('🎬 Expanding movie seed...\n');

  // Fetch from multiple endpoints to get diverse movies
  const endpoints = [
    '/movie/popular',
    '/movie/top_rated',
    '/movie/upcoming',
    '/trending/movie/week',
  ];

  let totalAdded = 0;

  for (const endpoint of endpoints) {
    const movies = await fetchTmdbMovies(endpoint);
    const added = await addMoviesToDb(movies);
    totalAdded += added;
    console.log(`  Added ${added} new movies from ${endpoint}\n`);
  }

  // Get total count
  const { count } = await supabase.from('movies').select('id', { count: 'exact' });

  console.log(`✅ Done!`);
  console.log(`   Total added this run: ${totalAdded}`);
  console.log(`   Total movies in DB: ${count}`);
}

expandSeed().catch(console.error);
