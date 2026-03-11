import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

async function fetchDirectors() {
  try {
    // Get movies with null director
    const { data: needsDirector } = await supabase
      .from('movies')
      .select('id, title, year')
      .is('director', null);

    if (!needsDirector || needsDirector.length === 0) {
      console.log('All movies have directors!');
      process.exit(0);
    }

    console.log(`Fetching directors for ${needsDirector.length} movies...\n`);

    const updates: any[] = [];
    let success = 0;

    for (const movie of needsDirector) {
      try {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
        const searchResp = await fetch(searchUrl);
        const searchData: any = await searchResp.json();

        if (searchData.results && searchData.results.length > 0) {
          const detailUrl = `https://api.themoviedb.org/3/movie/${searchData.results[0].id}?api_key=${tmdbKey}&append_to_response=credits`;
          const detailResp = await fetch(detailUrl);
          const detailData: any = await detailResp.json();

          if (detailData.credits && detailData.credits.crew) {
            const director = detailData.credits.crew.find((c: any) => c.job === 'Director');
            if (director) {
              updates.push({
                id: movie.id,
                director: director.name
              });
              if (success % 30 === 0) {
                console.log(`✓ ${success} - ${movie.title}: ${director.name}`);
              }
              success++;
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        // Skip
      }
    }

    console.log(`\nFetched directors for ${success}/${needsDirector.length} movies\n`);

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

fetchDirectors();
