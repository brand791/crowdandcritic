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

async function cleanup() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Final cleanup of remaining numeric genres...\n`);

    let count = 0;

    for (const movie of allMovies) {
      if (!Array.isArray(movie.genres)) continue;

      const hasNumeric = movie.genres.some((g: any) => /^\d+$/.test(String(g)));
      
      if (hasNumeric) {
        const newGenres: string[] = [];

        for (const g of movie.genres) {
          const str = String(g);
          if (/^\d+$/.test(str)) {
            const num = parseInt(str, 10);
            const name = GENRE_MAP[num];
            if (name) newGenres.push(name);
          } else {
            newGenres.push(str);
          }
        }

        const unique = Array.from(new Set(newGenres)).sort();

        await supabase
          .from('movies')
          .update({ genres: unique })
          .eq('id', movie.id);

        count++;
        if (count % 50 === 0) {
          console.log(`✓ ${count} cleaned`);
        }
      }
    }

    console.log(`\n✅ Cleaned up ${count} remaining movies!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

cleanup();
