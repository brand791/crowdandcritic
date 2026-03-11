import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// 22 missing canonical + 50 Metacritic all-time highest (with known scores)
const toAdd = [
  // Missing AFI/IMDb/S&S
  { title: 'The Godfather', year: 1972, rt: 97, imdb: 92 },
  { title: 'The Wizard of Oz', year: 1939, rt: 100, imdb: 83 },
  { title: 'Sunrise: A Song of Two Humans', year: 1927, rt: 98, imdb: 80 },
  { title: 'All the King\'s Men', year: 1949, rt: 85, imdb: 78 },
  { title: 'The Graduate', year: 1967, rt: 88, imdb: 79 },
  { title: 'The Searchers', year: 1956, rt: 96, imdb: 82 },
  { title: 'Rebel Without a Cause', year: 1955, rt: 96, imdb: 77 },
  { title: 'Grease', year: 1978, rt: 76, imdb: 73 },
  { title: 'West Side Story', year: 1961, rt: 99, imdb: 75 },
  { title: 'The Manchurian Candidate', year: 1962, rt: 100, imdb: 78 },
  { title: 'Snow White and the Seven Dwarfs', year: 1937, rt: 98, imdb: 75 },
  { title: 'The Best Years of Our Lives', year: 1946, rt: 97, imdb: 82 },
  { title: 'The Bridge on the River Kwai', year: 1957, rt: 99, imdb: 82 },
  { title: 'An American in Paris', year: 1951, rt: 99, imdb: 74 },
  { title: 'Swing Time', year: 1936, rt: 100, imdb: 80 },
  { title: 'Butch Cassidy and the Sundance Kid', year: 1969, rt: 96, imdb: 80 },
  { title: 'The Poseidon Adventure', year: 1972, rt: 73, imdb: 71 },
  { title: 'Sense and Sensibility', year: 1995, rt: 84, imdb: 75 },
  { title: 'Rules of the Game', year: 1939, rt: 99, imdb: 80 },
  { title: 'La Strada', year: 1954, rt: 99, imdb: 80 },
  { title: 'Citizen Kane', year: 1941, rt: 100, imdb: 86 },
  { title: 'Modern Times', year: 1936, rt: 99, imdb: 82 },
  
  // Top Metacritic all-time (additional high-quality films)
  { title: 'Whiplash', year: 2014, rt: 98, imdb: 86 },
  { title: 'The Shape of Water', year: 2017, rt: 92, imdb: 75 },
  { title: 'Moonlight', year: 2016, rt: 98, imdb: 79 },
  { title: 'Mulholland Drive', year: 2001, rt: 84, imdb: 77 },
  { title: 'There Will Be Blood', year: 2007, rt: 91, imdb: 84 },
  { title: 'The Master', year: 2012, rt: 87, imdb: 75 },
  { title: 'Under the Skin', year: 2013, rt: 84, imdb: 72 },
  { title: 'The Turin Horse', year: 2011, rt: 73, imdb: 70 },
  { title: 'Boyhood', year: 2014, rt: 97, imdb: 77 },
  { title: 'A Serious Man', year: 2009, rt: 89, imdb: 75 },
  { title: 'Winter Light', year: 1963, rt: 95, imdb: 78 },
  { title: 'The Seventh Seal', year: 1957, rt: 99, imdb: 82 },
  { title: 'Wild Strawberries', year: 1957, rt: 98, imdb: 82 },
  { title: 'Ikiru', year: 1952, rt: 98, imdb: 80 },
  { title: 'Tokyo Story', year: 1953, rt: 100, imdb: 80 },
  { title: 'Rashomon', year: 1950, rt: 99, imdb: 80 },
  { title: 'Cleo from 5 to 7', year: 1962, rt: 98, imdb: 77 },
  { title: 'The 400 Blows', year: 1959, rt: 99, imdb: 80 },
  { title: 'L\'Avventura', year: 1960, rt: 99, imdb: 78 },
  { title: 'La Jetée', year: 1962, rt: 99, imdb: 79 },
  { title: 'Stalker', year: 1979, rt: 95, imdb: 81 },
  { title: 'The Sacrifice', year: 1986, rt: 92, imdb: 79 },
  { title: 'In the Mood for Love', year: 2000, rt: 95, imdb: 80 },
  { title: 'Mulholland Drive', year: 2001, rt: 84, imdb: 77 },
  { title: 'Cache', year: 2005, rt: 88, imdb: 74 },
  { title: 'The Son', year: 2002, rt: 87, imdb: 78 },
  { title: 'Hunger', year: 2008, rt: 85, imdb: 74 },
  { title: 'A Prophet', year: 2009, rt: 90, imdb: 80 },
  { title: 'Uncle Boonmee Who Can Recall His Past Lives', year: 2010, rt: 74, imdb: 71 },
  { title: 'Certified Copy', year: 2010, rt: 80, imdb: 73 },
  { title: 'Harakiri', year: 1962, rt: 100, imdb: 84 },
  { title: 'Sansho the Bailiff', year: 1954, rt: 99, imdb: 81 },
  { title: 'Floating Clouds', year: 1955, rt: 96, imdb: 78 },
  { title: 'The Constant Gardener', year: 2005, rt: 83, imdb: 73 },
  { title: 'The Lives of Others', year: 2006, rt: 98, imdb: 83 },
  { title: 'Cell 211', year: 2009, rt: 90, imdb: 79 },
  { title: 'The Skin I Live In', year: 2011, rt: 84, imdb: 79 },
  { title: 'Holy Motors', year: 2012, rt: 78, imdb: 69 },
  { title: 'Pieta', year: 2012, rt: 74, imdb: 68 },
  { title: 'It Comes at Night', year: 2017, rt: 88, imdb: 64 },
  { title: 'Loveless', year: 2017, rt: 88, imdb: 78 },
];

async function addCanonical() {
  try {
    // Get existing movies
    const { data: existing } = await supabase
      .from('movies')
      .select('title, year');
    
    const existingSet = new Set(existing?.map(m => `${m.title}|${m.year}`) || []);
    
    console.log(`Current database: ${existing?.length} movies\n`);
    console.log(`Checking ${toAdd.length} canonical films...\n`);

    // Filter to only new ones
    const toInsert = toAdd.filter(m => !existingSet.has(`${m.title}|${m.year}`));
    
    console.log(`Found ${toInsert.length} new films to add:\n`);
    toInsert.slice(0, 20).forEach(m => {
      console.log(`  ${m.title} (${m.year}): RT ${m.rt}% + IMDb ${m.imdb}%`);
    });
    if (toInsert.length > 20) {
      console.log(`  ... and ${toInsert.length - 20} more`);
    }

    if (toInsert.length === 0) {
      console.log('All films already in database!');
      process.exit(0);
    }

    // Insert movies
    const movieInserts = toInsert.map(m => ({
      title: m.title,
      year: m.year,
      poster_url: null,
      genres: [],
      director: null,
      runtime_minutes: null,
      plot: null
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('movies')
      .insert(movieInserts)
      .select('id, title, year');

    if (insertError) {
      console.error('Insert error:', insertError.message);
      process.exit(1);
    }

    console.log(`\n✅ Inserted ${inserted?.length} movies`);

    // Now add their scores
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

    const { error: scoreError } = await supabase
      .from('movie_scores')
      .insert(scoreInserts);

    if (scoreError) {
      console.error('Score insert error:', scoreError.message);
      process.exit(1);
    }

    console.log(`✅ Added ${scoreInserts.length} scores`);

    // Verify
    const { data: allNow } = await supabase
      .from('movie_scores')
      .select('id');

    console.log(`\n=== FINAL STATE ===`);
    console.log(`Total movies: ${allNow?.length}`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

addCanonical();
