import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

async function fillRemaining() {
  try {
    // Get movies still missing data
    const { data: needsData } = await supabase
      .from('movies')
      .select('id, title, year, director, genres, poster_url')
      .or('director.is.null,genres.eq.,poster_url.is.null')
      .limit(250);

    if (!needsData || needsData.length === 0) {
      console.log('All metadata complete!');
      process.exit(0);
    }

    console.log(`\nFilling remaining ${needsData.length} movies...\n`);

    const updates: any[] = [];
    let updated = 0;

    for (const movie of needsData) {
      try {
        // Try multiple search approaches
        const queries = [
          movie.title,
          movie.title.split(':')[0], // Try before colon
          movie.title.substring(0, 20) // Try first 20 chars
        ];

        let found = false;

        for (const query of queries) {
          if (found) break;

          const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&year=${movie.year}`;
          const searchResp = await fetch(searchUrl);
          const searchData: any = await searchResp.json();

          if (searchData.results && searchData.results.length > 0) {
            const tmdbMovie = searchData.results[0];
            const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbMovie.id}?api_key=${tmdbKey}&append_to_response=credits`;
            const detailResp = await fetch(detailUrl);
            const detailData: any = await detailResp.json();

            const update: any = { id: movie.id };
            let hadUpdate = false;

            // Director
            if (!movie.director && detailData.credits?.crew) {
              const dir = detailData.credits.crew.find((c: any) => c.job === 'Director');
              if (dir) {
                update.director = dir.name;
                hadUpdate = true;
              }
            }

            // Genres
            if ((!movie.genres || movie.genres.length === 0) && detailData.genres) {
              update.genres = detailData.genres.map((g: any) => g.name);
              hadUpdate = true;
            }

            // Poster
            if (!movie.poster_url && detailData.poster_path) {
              update.poster_url = `https://image.tmdb.org/t/p/w342${detailData.poster_path}`;
              hadUpdate = true;
            }

            if (hadUpdate) {
              updates.push(update);
              updated++;
              found = true;

              if (updated % 30 === 0) {
                console.log(`✓ ${updated} - ${movie.title}`);
              }
            }
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        }

      } catch (err) {
        // Skip
      }
    }

    console.log(`\nFound data for ${updated}/${needsData.length} movies\n`);

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
    }

    console.log(`\n✅ Metadata fetch complete!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fillRemaining();
