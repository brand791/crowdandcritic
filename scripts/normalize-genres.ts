import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

// TMDB Genre ID to Name mapping
const GENRE_NAMES: { [key: number]: string } = {
  12: 'Adventure',
  14: 'Fantasy',
  16: 'Animation',
  18: 'Drama',
  27: 'Horror',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  37: 'Western',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  878: 'Science Fiction',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  10752: 'War',
  10770: 'TV Movie',
};

async function normalizeGenres() {
  try {
    // Get all movies
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, title, year, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Normalizing ${allMovies.length} movies' genres...\n`);

    const updates: any[] = [];
    let normalized = 0;

    for (const movie of allMovies) {
      let needsUpdate = false;
      let newGenres: string[] = [];

      if (Array.isArray(movie.genres) && movie.genres.length > 0) {
        // Convert any IDs to names and remove duplicates
        const genreSet = new Set<string>();
        
        movie.genres.forEach((g: any) => {
          if (typeof g === 'number') {
            // It's an ID - convert to name
            const name = GENRE_NAMES[g];
            if (name) {
              genreSet.add(name);
              needsUpdate = true;
            }
          } else if (typeof g === 'string') {
            // It's already a name - keep it
            genreSet.add(g);
          }
        });

        newGenres = Array.from(genreSet).sort();
      } else {
        // No genres - need to fetch
        needsUpdate = true;
      }

      if (needsUpdate) {
        updates.push({
          id: movie.id,
          genres: newGenres
        });
        normalized++;

        if (normalized % 50 === 0) {
          console.log(`✓ ${normalized} movies processed`);
        }
      }
    }

    console.log(`\nFound ${normalized} movies needing genre updates\n`);

    // Now fetch missing genres from TMDB
    const missingGenres = updates.filter(u => u.genres.length === 0);
    console.log(`Fetching genres from TMDB for ${missingGenres.length} movies...\n`);

    let fetched = 0;
    for (const update of missingGenres) {
      try {
        const movie = allMovies.find(m => m.id === update.id);
        if (!movie) continue;

        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
        const searchResp = await fetch(searchUrl);
        const searchData: any = await searchResp.json();

        if (searchData.results && searchData.results.length > 0) {
          const tmdbMovie = searchData.results[0];
          const genres = tmdbMovie.genre_ids?.map((id: number) => GENRE_NAMES[id]).filter(Boolean) || [];
          
          if (genres.length > 0) {
            update.genres = genres;
            fetched++;

            if (fetched % 30 === 0) {
              console.log(`✓ ${fetched} - ${movie.title}: ${genres.join(', ')}`);
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        // Skip
      }
    }

    console.log(`\nFetched genres for ${fetched}/${missingGenres.length} movies\n`);

    // Update database
    if (updates.length > 0) {
      for (let i = 0; i < updates.length; i += 100) {
        const batch = updates.slice(i, i + 100);
        const { error } = await supabase
          .from('movies')
          .upsert(batch, { onConflict: 'id' });

        if (!error) {
          console.log(`✓ Updated ${Math.min(i + 100, updates.length)}/${updates.length}`);
        }
      }

      console.log(`\n✅ Genres normalized and updated!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

normalizeGenres();
