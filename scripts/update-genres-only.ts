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

async function updateGenresOnly() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Updating genres only (not full rows)...\n`);

    let updateCount = 0;

    for (const movie of allMovies) {
      if (!Array.isArray(movie.genres) || movie.genres.length === 0) continue;

      const newGenres: string[] = [];
      let hasNumeric = false;

      for (const g of movie.genres) {
        if (typeof g === 'number') {
          const name = GENRE_MAP[g];
          if (name) newGenres.push(name);
          hasNumeric = true;
        } else {
          const num = parseInt(String(g), 10);
          if (!isNaN(num) && GENRE_MAP[num]) {
            newGenres.push(GENRE_MAP[num]);
            hasNumeric = true;
          } else {
            newGenres.push(String(g));
          }
        }
      }

      const unique = Array.from(new Set(newGenres)).sort();

      if (hasNumeric) {
        const { error } = await supabase
          .from('movies')
          .update({ genres: unique })
          .eq('id', movie.id);

        if (!error) {
          updateCount++;
          if (updateCount % 100 === 0) {
            console.log(`✓ ${updateCount} movies updated`);
          }
        }
      }
    }

    console.log(`\n✅ Updated ${updateCount} movies!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

updateGenresOnly();
