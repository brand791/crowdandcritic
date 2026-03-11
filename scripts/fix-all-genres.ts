import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Complete TMDB Genre mapping
const GENRE_MAP: { [key: number]: string } = {
  12: 'Adventure',
  14: 'Fantasy',
  16: 'Animation',
  18: 'Drama',
  27: 'Horror',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  37: 'Western',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  878: 'Science Fiction',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  10752: 'War',
  10770: 'TV Movie',
};

async function fixAllGenres() {
  try {
    // Get all movies
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    if (!allMovies) {
      process.exit(0);
    }

    console.log(`Converting all genres to proper format...\n`);

    const updates: any[] = [];
    let needsUpdate = 0;

    for (const movie of allMovies) {
      const newGenres = new Set<string>();
      let hasIdFormat = false;

      if (Array.isArray(movie.genres) && movie.genres.length > 0) {
        movie.genres.forEach((g: any) => {
          if (typeof g === 'number') {
            // It's an ID - convert to name
            const name = GENRE_MAP[g];
            if (name) {
              newGenres.add(name);
              hasIdFormat = true;
            }
          } else if (typeof g === 'string') {
            // Check if it's a number string
            const num = parseInt(g, 10);
            if (!isNaN(num) && GENRE_MAP[num]) {
              // It's a number as string - convert
              newGenres.add(GENRE_MAP[num]);
              hasIdFormat = true;
            } else {
              // It's a proper name
              newGenres.add(g);
            }
          }
        });

        const sortedGenres = Array.from(newGenres).sort();
        
        // Only update if format changed or genres differ
        if (hasIdFormat) {
          updates.push({
            id: movie.id,
            genres: sortedGenres
          });
          needsUpdate++;
        }
      }
    }

    console.log(`Found ${needsUpdate} movies with ID-format genres to convert\n`);

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

      console.log(`\n✅ All genres converted to proper format!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fixAllGenres();
