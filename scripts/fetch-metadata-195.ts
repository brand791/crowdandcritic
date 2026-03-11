import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

async function fetchMetadata() {
  try {
    // Get all movies missing director or genres
    const { data: needsMetadata } = await supabase
      .from('movies')
      .select('id, title, year, director, genres, poster_url, tmdb_id')
      .or('director.is.null,genres.eq.[]');

    if (!needsMetadata || needsMetadata.length === 0) {
      console.log('All movies have metadata!');
      process.exit(0);
    }

    console.log(`Found ${needsMetadata.length} movies missing metadata\n`);

    const updates: any[] = [];
    let fetched = 0;

    for (const movie of needsMetadata) {
      try {
        // Search TMDB for the movie
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
        const searchResp = await fetch(searchUrl);
        const searchData: any = await searchResp.json();

        if (searchData.results && searchData.results.length > 0) {
          const tmdbMovie = searchData.results[0];
          const tmdbId = tmdbMovie.id;

          // Fetch full details
          const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbKey}&append_to_response=credits`;
          const detailResp = await fetch(detailUrl);
          const detailData: any = await detailResp.json();

          // Extract director
          let director = null;
          if (detailData.credits && detailData.credits.crew) {
            const directorObj = detailData.credits.crew.find((c: any) => c.job === 'Director');
            if (directorObj) {
              director = directorObj.name;
            }
          }

          // Extract genres
          const genres = detailData.genres?.map((g: any) => g.name) || [];

          // Get poster
          const posterUrl = detailData.poster_path 
            ? `https://image.tmdb.org/t/p/w342${detailData.poster_path}`
            : null;

          if (director || genres.length > 0 || posterUrl) {
            updates.push({
              id: movie.id,
              director: director || movie.director,
              genres: genres.length > 0 ? genres : movie.genres,
              poster_url: posterUrl || movie.poster_url,
              tmdb_id: tmdbId
            });

            console.log(`✓ ${movie.title} (${movie.year}): ${director ? `Director: ${director}` : ''} ${genres.length > 0 ? `Genres: ${genres.join(', ')}` : ''}`);
            fetched++;
          }
        }

        // Rate limit: 40 requests per 10 seconds
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        console.log(`⚠️  ${movie.title}: Error - ${err}`);
      }
    }

    console.log(`\nFetched metadata for ${fetched} movies\n`);

    // Update in batches
    if (updates.length > 0) {
      for (let i = 0; i < updates.length; i += 50) {
        const batch = updates.slice(i, i + 50);
        const { error } = await supabase
          .from('movies')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          console.error(`Batch ${i / 50 + 1} error:`, error.message);
        } else {
          console.log(`✓ Updated ${Math.min(i + 50, updates.length)}/${updates.length}`);
        }
      }

      console.log(`\n✅ Updated ${updates.length} movies with metadata`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fetchMetadata();
