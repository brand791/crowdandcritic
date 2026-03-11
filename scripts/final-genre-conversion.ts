import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const GENRE_MAP: { [key: number]: string } = {
  12: 'Adventure', 14: 'Fantasy', 16: 'Animation', 18: 'Drama', 27: 'Horror',
  28: 'Action', 35: 'Comedy', 36: 'History', 37: 'Western', 53: 'Thriller',
  80: 'Crime', 99: 'Documentary', 878: 'Science Fiction', 9648: 'Mystery',
  10402: 'Music', 10749: 'Romance', 10751: 'Family', 10752: 'War', 10770: 'TV Movie',
};

async function finalConversion() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Final genre conversion pass...\n`);

    const updates: any[] = [];
    let converted = 0;

    for (const movie of allMovies) {
      if (!Array.isArray(movie.genres)) continue;

      const cleanGenres = new Set<string>();
      let hasNumericId = false;

      for (const g of movie.genres) {
        if (typeof g === 'number') {
          // Convert numeric ID
          const name = GENRE_MAP[g];
          if (name) {
            cleanGenres.add(name);
            hasNumericId = true;
          }
        } else if (typeof g === 'string') {
          const num = parseInt(g, 10);
          if (!isNaN(num) && GENRE_MAP[num]) {
            // String number - convert
            cleanGenres.add(GENRE_MAP[num]);
            hasNumericId = true;
          } else {
            // Regular string genre name
            cleanGenres.add(g);
          }
        }
      }

      if (hasNumericId || cleanGenres.size > 0) {
        updates.push({
          id: movie.id,
          genres: Array.from(cleanGenres).sort()
        });
        converted++;
      }
    }

    console.log(`Converting ${converted} movies\n`);

    if (updates.length > 0) {
      for (let i = 0; i < updates.length; i += 200) {
        const batch = updates.slice(i, i + 200);
        const { error } = await supabase
          .from('movies')
          .upsert(batch, { onConflict: 'id' });

        if (!error) {
          console.log(`✓ ${Math.min(i + 200, updates.length)}/${updates.length}`);
        }
      }
    }

    console.log(`\n✅ Complete!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

finalConversion();
