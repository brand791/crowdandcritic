import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

async function fetchComplete() {
  try {
    // Get movies missing director or genres or poster
    const { data: needsData } = await supabase
      .from('movies')
      .select('id, title, year, director, genres, poster_url')
      .or('director.is.null,genres.eq.,poster_url.is.null')
      .limit(350);

    if (!needsData || needsData.length === 0) {
      console.log('All movies complete!');
      process.exit(0);
    }

    console.log(`Fetching metadata for ${needsData.length} movies from TMDB...\n`);

    const updates: any[] = [];
    let success = 0;

    for (const movie of needsData) {
      try {
        // Search TMDB
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
        const searchResp = await fetch(searchUrl);
        const searchData: any = await searchResp.json();

        if (searchData.results && searchData.results.length > 0) {
          const tmdbMovie = searchData.results[0];
          const tmdbId = tmdbMovie.id;

          // Fetch full movie details with credits
          const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbKey}&append_to_response=credits`;
          const detailResp = await fetch(detailUrl);
          const detailData: any = await detailResp.json();

          // Extract director
          let director = movie.director;
          if (!director && detailData.credits && detailData.credits.crew) {
            const directorObj = detailData.credits.crew.find((c: any) => c.job === 'Director');
            if (directorObj) {
              director = directorObj.name;
            }
          }

          // Extract genres
          let genres = movie.genres && movie.genres.length > 0 ? movie.genres : [];
          if (genres.length === 0 && detailData.genres) {
            genres = detailData.genres.map((g: any) => g.name);
          }

          // Get poster
          let posterUrl = movie.poster_url;
          if (!posterUrl && detailData.poster_path) {
            posterUrl = `https://image.tmdb.org/t/p/w342${detailData.poster_path}`;
          }

          updates.push({
            id: movie.id,
            director: director,
            genres: genres,
            poster_url: posterUrl
          });

          if (success % 20 === 0) {
            console.log(`✓ ${success}/${needsData.length} - ${movie.title} (${movie.year})`);
          }
          success++;
        }

        // Rate limit: 300ms per request
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        // Silently skip errors
      }
    }

    console.log(`\nFetched metadata for ${success}/${needsData.length} movies`);

    // Update database in batches
    if (updates.length > 0) {
      console.log(`\nUpdating database...\n`);
      
      for (let i = 0; i < updates.length; i += 100) {
        const batch = updates.slice(i, i + 100);
        const { error } = await supabase
          .from('movies')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          console.error(`Batch error:`, error.message);
        } else {
          const updated = Math.min(i + 100, updates.length);
          console.log(`✓ Updated ${updated}/${updates.length} movies`);
        }
      }

      console.log(`\n✅ Complete! All metadata fetched and saved.`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fetchComplete();
