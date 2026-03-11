import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

async function fetchPosters() {
  try {
    // Get all movies without poster
    const { data: noPoster } = await supabase
      .from('movies')
      .select('id, title, year')
      .is('poster_url', null);

    if (!noPoster || noPoster.length === 0) {
      console.log('All movies have posters!');
      process.exit(0);
    }

    console.log(`Fetching posters for ${noPoster.length} movies...\n`);

    const updates: any[] = [];
    let success = 0;

    for (const movie of noPoster) {
      try {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
        const searchResp = await fetch(searchUrl);
        const searchData: any = await searchResp.json();

        if (searchData.results && searchData.results.length > 0) {
          const tmdbMovie = searchData.results[0];
          if (tmdbMovie.poster_path) {
            updates.push({
              id: movie.id,
              poster_url: `https://image.tmdb.org/t/p/w342${tmdbMovie.poster_path}`
            });
            success++;

            if (success % 30 === 0) {
              console.log(`✓ ${success} - ${movie.title}`);
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        // Skip
      }
    }

    console.log(`\nFetched posters for ${success}/${noPoster.length} movies\n`);

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

      console.log(`\n✅ Posters updated!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fetchPosters();
