import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const tmdbKey = process.env.TMDB_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const TMDB_API = 'https://api.themoviedb.org/3';
const DELAY_MS = 500;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTmdbMovies(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching:`, error);
    return [];
  }
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
      continue;
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
      }
    } catch (error) {
      // Silent fail for duplicates
    }
  }

  return addedCount;
}

async function expandSeedAdvanced() {
  console.log('🎬 Expanding movie seed (advanced search)...\n');

  const existingIds = await getExistingIds();
  const currentTotal = existingIds.size;
  const targetTotal = 1000;
  const needed = targetTotal - currentTotal;

  console.log(`Current: ${currentTotal} movies, Need: ${needed} more to reach ${targetTotal}\n`);

  let totalAdded = 0;

  // Search by year ranges (go back further)
  const years = [
    { start: 2020, end: 2024 },
    { start: 2015, end: 2019 },
    { start: 2010, end: 2014 },
    { start: 2000, end: 2009 },
    { start: 1990, end: 1999 },
  ];

  for (const yearRange of years) {
    if (totalAdded >= needed) break;

    console.log(`Searching ${yearRange.start}-${yearRange.end}...`);

    for (let page = 1; page <= 10; page++) {
      if (totalAdded >= needed) break;

      const url =
        `${TMDB_API}/discover/movie?` +
        `api_key=${tmdbKey}&` +
        `primary_release_date.gte=${yearRange.start}-01-01&` +
        `primary_release_date.lte=${yearRange.end}-12-31&` +
        `sort_by=popularity.desc&` +
        `page=${page}&` +
        `language=en-US`;

      const movies = await fetchTmdbMovies(url);
      const added = await addMoviesToDb(movies);
      totalAdded += added;

      if (added > 0) {
        console.log(`  Page ${page}: +${added} movies (total added: ${totalAdded})`);
      }

      await delay(DELAY_MS);
    }
  }

  // Get final count
  const { count } = await supabase.from('movies').select('id', { count: 'exact' });

  console.log(`\n✅ Done!`);
  console.log(`   Total added this run: ${totalAdded}`);
  console.log(`   Total movies in DB: ${count}`);
}

expandSeedAdvanced().catch(console.error);
