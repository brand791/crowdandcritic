import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';
const supabase = createClient(supabaseUrl, supabaseKey);

const classicScores = [
  { title: 'The Last Temptation of Christ', year: 1988, rt: 82, imdb: 75 },
  { title: 'The Maltese Falcon', year: 1941, rt: 100, imdb: 80 },
  { title: 'Breathless', year: 1960, rt: 100, imdb: 83 },
  { title: 'Nosferatu', year: 1922, rt: 98, imdb: 80 },
  { title: 'Battleship Potemkin', year: 1925, rt: 98, imdb: 84 },
  { title: 'Frankenstein', year: 1931, rt: 98, imdb: 74 },
  { title: 'Breakfast at Tiffany\'s', year: 1961, rt: 99, imdb: 80 },
  { title: 'The Birds', year: 1963, rt: 96, imdb: 82 },
  { title: 'Shadow of a Doubt', year: 1943, rt: 100, imdb: 82 },
  { title: 'Marnie', year: 1964, rt: 93, imdb: 73 },
  { title: 'A Streetcar Named Desire', year: 1951, rt: 100, imdb: 81 },
  { title: 'Jaws', year: 1975, rt: 97, imdb: 92 },
  { title: 'Dr. Strangelove', year: 1964, rt: 97, imdb: 84 },
  { title: 'Dances with Wolves', year: 1990, rt: 82, imdb: 81 },
];

async function addMissing() {
  try {
    console.log(`Checking which classic films need scores...\n`);

    const toAdd: any[] = [];

    for (const film of classicScores) {
      // Check if movie exists
      const { data: movie } = await supabase
        .from('movies')
        .select('id')
        .eq('title', film.title)
        .eq('year', film.year)
        .single();

      if (!movie) {
        console.log(`⚠️  ${film.title} not in movies table`);
        continue;
      }

      // Check if scores exist
      const { data: scores } = await supabase
        .from('movie_scores')
        .select('id')
        .eq('movie_id', movie.id)
        .single();

      if (!scores) {
        const composite = (film.rt * 0.5) + (film.imdb * 0.5);
        console.log(`✓ ${film.title} needs score: RT ${film.rt}% + IMDb ${film.imdb}% = ${Math.round(composite * 10) / 10}`);
        
        toAdd.push({
          movie_id: movie.id,
          rt_tomatometer: film.rt,
          imdb_rating: film.imdb,
          composite_score: Math.round(composite * 10) / 10
        });
      } else {
        console.log(`✓ ${film.title} already has scores`);
      }
    }

    if (toAdd.length > 0) {
      const { error } = await supabase
        .from('movie_scores')
        .insert(toAdd);

      if (error) {
        console.error('Insert error:', error.message);
      } else {
        console.log(`\n✅ Added ${toAdd.length} classic scores`);
      }
    } else {
      console.log(`\nAll classics already have scores!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

addMissing();
