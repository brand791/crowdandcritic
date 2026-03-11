import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanup() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Final cleanup: removing all numeric genre IDs...\n`);

    const updates: any[] = [];

    for (const movie of allMovies) {
      if (!Array.isArray(movie.genres) || movie.genres.length === 0) continue;

      // Keep ONLY string genres
      const stringGenres = movie.genres.filter((g: any) => {
        if (typeof g === 'string') {
          // Make sure it's not a numeric string
          const num = parseInt(g, 10);
          return isNaN(num);
        }
        return false;
      }).sort();

      // If different from original, update
      if (stringGenres.length !== movie.genres.length || stringGenres.length === 0) {
        updates.push({
          id: movie.id,
          genres: stringGenres.length > 0 ? stringGenres : []
        });
      }
    }

    console.log(`Removing numeric IDs from ${updates.length} movies\n`);

    if (updates.length > 0) {
      for (let i = 0; i < updates.length; i += 200) {
        const batch = updates.slice(i, i + 200);
        await supabase.from('movies').upsert(batch, { onConflict: 'id' });
        console.log(`✓ ${Math.min(i + 200, updates.length)}/${updates.length}`);
      }
    }

    console.log(`\n✅ Final cleanup complete!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

cleanup();
