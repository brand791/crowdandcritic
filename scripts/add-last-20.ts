import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const toAdd = [
  { title: 'Godzilla Minus One', year: 2023, rt: 97, imdb: 79 },
  { title: 'The Iron Claw', year: 2023, rt: 93, imdb: 75 },
  { title: 'Killers of the Flower Moon', year: 2023, rt: 85, imdb: 75 },
  { title: 'American Fiction', year: 2023, rt: 90, imdb: 75 },
  { title: 'Past Lives', year: 2023, rt: 95, imdb: 79 },
  { title: 'May December', year: 2023, rt: 90, imdb: 74 },
  { title: 'Passages', year: 2023, rt: 87, imdb: 71 },
  { title: 'Club Zero', year: 2023, rt: 63, imdb: 62 },
  { title: 'Close', year: 2022, rt: 93, imdb: 78 },
  { title: 'All the Beauty and the Bloodshed', year: 2022, rt: 96, imdb: 73 },
  { title: 'War Pony', year: 2022, rt: 86, imdb: 72 },
  { title: 'Living', year: 2022, rt: 86, imdb: 72 },
  { title: 'Crimes of the Future', year: 2022, rt: 61, imdb: 63 },
  { title: 'The Eternal Memory', year: 2023, rt: 97, imdb: 79 },
  { title: 'Sanctuary', year: 2022, rt: 93, imdb: 76 },
  { title: 'Le Deuxième Acte', year: 2022, rt: 88, imdb: 71 },
  { title: 'Apollo 13', year: 1995, rt: 96, imdb: 78 },
  { title: 'All the Presidents Men', year: 1976, rt: 96, imdb: 80 },
  { title: 'Spotlight', year: 2015, rt: 98, imdb: 80 },
  { title: 'Lincoln', year: 2012, rt: 90, imdb: 74 },
];

async function addLast() {
  try {
    const { data: existing } = await supabase
      .from('movies')
      .select('title, year');
    
    const existingSet = new Set(existing?.map(m => `${m.title}|${m.year}`) || []);
    
    console.log(`Current: ${existing?.length}\n`);

    const toInsert = toAdd.filter(m => !existingSet.has(`${m.title}|${m.year}`));
    
    console.log(`Adding ${toInsert.length} final films`);

    if (toInsert.length === 0) {
      process.exit(0);
    }

    const { data: inserted } = await supabase
      .from('movies')
      .insert(toInsert.map(m => ({
        title: m.title,
        year: m.year,
        poster_url: null,
        genres: [],
        director: null,
        runtime_minutes: null,
        plot: null
      })))
      .select('id, title, year');

    const scoreInserts = (inserted || []).map((movie: any) => {
      const orig = toInsert.find(m => m.title === movie.title && m.year === movie.year);
      if (orig) {
        const composite = (orig.rt * 0.5) + (orig.imdb * 0.5);
        return {
          movie_id: movie.id,
          rt_tomatometer: orig.rt,
          imdb_rating: orig.imdb,
          composite_score: Math.round(composite * 10) / 10
        };
      }
      return null;
    }).filter(Boolean);

    await supabase
      .from('movie_scores')
      .insert(scoreInserts);

    const { data: allNow } = await supabase
      .from('movie_scores')
      .select('id');

    console.log(`\n✅ FINAL TOTAL: ${allNow?.length} MOVIES!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

addLast();
