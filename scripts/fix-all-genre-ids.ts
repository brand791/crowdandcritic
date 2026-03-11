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

async function fixAll() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Fixing all movies with numeric genre IDs...\n`);

    const updates: any[] = [];
    let fixed = 0;

    for (const movie of allMovies) {
      if (!Array.isArray(movie.genres) || movie.genres.length === 0) continue;

      // Collect all genres and convert
      const genreSet = new Set<string>();
      let hasNumeric = false;

      for (const g of movie.genres) {
        if (typeof g === 'number') {
          // Numeric ID
          const name = GENRE_MAP[g];
          if (name) {
            genreSet.add(name);
          }
          hasNumeric = true;
        } else if (typeof g === 'string') {
          // Check if it's a numeric string
          const num = parseInt(g, 10);
          if (!isNaN(num) && GENRE_MAP[num]) {
            // It's a numeric string that matches an ID - convert it
            genreSet.add(GENRE_MAP[num]);
            hasNumeric = true;
          } else {
            // It's a proper genre name
            genreSet.add(g);
          }
        }
      }

      const newGenres = Array.from(genreSet).sort();
      
      // Only update if changed
      if (hasNumeric || newGenres.length !== movie.genres.length) {
        updates.push({
          id: movie.id,
          genres: newGenres
        });
        fixed++;
      }
    }

    console.log(`Fixing ${fixed} movies\n`);

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

      console.log(`\n✅ All numeric genre IDs converted!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fixAll();
