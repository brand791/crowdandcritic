import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const GENRE_MAP: Record<number, string> = {
  10402: 'Music', 10749: 'Romance', 10751: 'Family', 10752: 'War', 10770: 'TV Movie',
  12: 'Adventure', 14: 'Fantasy', 16: 'Animation', 18: 'Drama', 27: 'Horror',
  28: 'Action', 35: 'Comedy', 36: 'History', 37: 'Western', 53: 'Thriller',
  80: 'Crime', 878: 'Science Fiction', 9648: 'Mystery', 99: 'Documentary',
};

async function brutalFix() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Brutal genre fix: removing ALL numeric IDs...\n`);

    const updates: any[] = [];
    let hasNumeric = 0;

    for (const movie of allMovies) {
      if (!Array.isArray(movie.genres)) continue;

      const newGenres: string[] = [];

      for (const g of movie.genres) {
        if (typeof g === 'number') {
          // Convert numeric ID to name
          const name = GENRE_MAP[g];
          if (name) newGenres.push(name);
          hasNumeric++;
        } else {
          // Check if it's a numeric string
          const num = parseInt(String(g), 10);
          if (!isNaN(num) && GENRE_MAP[num]) {
            newGenres.push(GENRE_MAP[num]);
            hasNumeric++;
          } else {
            // It's a proper genre name - keep it
            newGenres.push(String(g));
          }
        }
      }

      // Remove duplicates and sort
      const unique = Array.from(new Set(newGenres)).sort();

      // Only update if we changed something
      if (unique.length !== movie.genres.length || hasNumeric > 0) {
        updates.push({
          id: movie.id,
          genres: unique
        });
      }
    }

    console.log(`Found ${hasNumeric} numeric IDs across ${updates.length} movies\n`);

    if (updates.length > 0) {
      for (let i = 0; i < updates.length; i += 200) {
        const batch = updates.slice(i, i + 200);
        const { error } = await supabase
          .from('movies')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          console.error(`Error in batch ${i/200}:`, error);
        } else {
          console.log(`✓ ${Math.min(i + 200, updates.length)}/${updates.length}`);
        }
      }
    }

    console.log(`\n✅ Brutal genre fix complete!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

brutalFix();
