import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

async function fetchGenresPosters() {
  try {
    // Get all movies
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, title, year, genres, poster_url');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Fetching genres & posters for ${allMovies.length} movies...\n`);

    const updates: any[] = [];
    let success = 0;

    for (const movie of allMovies) {
      try {
        // Skip if has both genres and poster
        const hasGenres = Array.isArray(movie.genres) && movie.genres.length > 0;
        const hasPoster = !!movie.poster_url;
        
        if (hasGenres && hasPoster) {
          continue;
        }

        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
        const searchResp = await fetch(searchUrl);
        const searchData: any = await searchResp.json();

        if (searchData.results && searchData.results.length > 0) {
          const tmdbMovie = searchData.results[0];
          const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbMovie.id}?api_key=${tmdbKey}`;
          const detailResp = await fetch(detailUrl);
          const detailData: any = await detailResp.json();

          const update: any = { id: movie.id };
          
          // Get genres
          if (!hasGenres && detailData.genres) {
            update.genres = detailData.genres.map((g: any) => g.name);
          }

          // Get poster
          if (!hasPoster && detailData.poster_path) {
            update.poster_url = `https://image.tmdb.org/t/p/w342${detailData.poster_path}`;
          }

          if (Object.keys(update).length > 1) {
            updates.push(update);
            if (success % 50 === 0) {
              console.log(`✓ ${success} - ${movie.title}`);
            }
            success++;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        // Skip
      }
    }

    console.log(`\nProcessed ${success} movies\n`);

    // Update
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
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fetchGenresPosters();
