import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';
const supabase = createClient(supabaseUrl, supabaseKey);

// Top 250 classic and acclaimed films missing from database
const toAdd = [
  { title: 'The Last Temptation of Christ', year: 1988, imdbId: 'tt0095497' },
  { title: 'The Maltese Falcon', year: 1941, imdbId: 'tt0033856' },
  { title: 'Singin\' in the Rain', year: 1952, imdbId: 'tt0045152' },
  { title: 'Sunset Boulevard', year: 1950, imdbId: 'tt0043014' },
  { title: 'The Third Man', year: 1949, imdbId: 'tt0041959' },
  { title: 'It\'s a Wonderful Life', year: 1946, imdbId: 'tt0038650' },
  { title: 'The Seventh Seal', year: 1957, imdbId: 'tt0050976' },
  { title: 'Breathless', year: 1960, imdbId: 'tt0053472' },
  { title: 'Bicycle Thieves', year: 1948, imdbId: 'tt0040522' },
  { title: 'The 400 Blows', year: 1959, imdbId: 'tt0053472' },
  { title: 'City Lights', year: 1931, imdbId: 'tt0021749' },
  { title: 'Metropolis', year: 1927, imdbId: 'tt0017136' },
  { title: 'Nosferatu', year: 1922, imdbId: 'tt0013442' },
  { title: 'Battleship Potemkin', year: 1925, imdbId: 'tt0015648' },
  { title: 'M', year: 1931, imdbId: 'tt0021884' },
  { title: 'Frankenstein', year: 1931, imdbId: 'tt0021884' },
  { title: 'All About Eve', year: 1950, imdbId: 'tt0042339' },
  { title: 'Singin\' in the Rain', year: 1952, imdbId: 'tt0045152' },
  { title: 'The Great Dictator', year: 1940, imdbId: 'tt0031381' },
  { title: 'Roman Holiday', year: 1953, imdbId: 'tt0045152' },
  { title: 'Breakfast at Tiffany\'s', year: 1961, imdbId: 'tt0054698' },
  { title: 'North by Northwest', year: 1959, imdbId: 'tt0054047' },
  { title: 'Vertigo', year: 1958, imdbId: 'tt0052357' },
  { title: 'Psycho', year: 1960, imdbId: 'tt0054215' },
  { title: 'Rear Window', year: 1954, imdbId: 'tt0047396' },
  { title: 'The Birds', year: 1963, imdbId: 'tt0056573' },
  { title: 'Rope', year: 1948, imdbId: 'tt0040746' },
  { title: 'Shadow of a Doubt', year: 1943, imdbId: 'tt0036342' },
  { title: 'Marnie', year: 1964, imdbId: 'tt0058329' },
  { title: 'Dial M for Murder', year: 1954, imdbId: 'tt0046912' },
  { title: 'Vertigo', year: 1958, imdbId: 'tt0052357' },
  { title: 'Singin\' in the Rain', year: 1952, imdbId: 'tt0045152' },
  { title: 'A Streetcar Named Desire', year: 1951, imdbId: 'tt0044081' },
  { title: 'The Godfather Part II', year: 1974, imdbId: 'tt0071562' },
  { title: 'Chinatown', year: 1974, imdbId: 'tt0071315' },
  { title: 'Taxi Driver', year: 1976, imdbId: 'tt0075314' },
  { title: 'One Flew Over the Cuckoo\'s Nest', year: 1975, imdbId: 'tt0073486' },
  { title: 'Jaws', year: 1975, imdbId: 'tt0073195' },
  { title: 'The Godfather', year: 1972, imdbId: 'tt0068646' },
  { title: 'A Clockwork Orange', year: 1971, imdbId: 'tt0060669' },
  { title: '2001: A Space Odyssey', year: 1968, imdbId: 'tt0062622' },
  { title: 'Dr. Strangelove', year: 1964, imdbId: 'tt0057012' },
  { title: 'Lawrence of Arabia', year: 1962, imdbId: 'tt0056172' },
  { title: 'The Silence of the Lambs', year: 1991, imdbId: 'tt0102926' },
  { title: 'Goodfellas', year: 1990, imdbId: 'tt0099674' },
  { title: 'Dances with Wolves', year: 1990, imdbId: 'tt0099348' },
  { title: 'The Shining', year: 1980, imdbId: 'tt0081505' },
  { title: 'Blade Runner', year: 1982, imdbId: 'tt0083658' },
  { title: 'The Empire Strikes Back', year: 1980, imdbId: 'tt0080684' },
  { title: 'Raiders of the Lost Ark', year: 1981, imdbId: 'tt0082971' },
  { title: 'Back to the Future', year: 1985, imdbId: 'tt0088763' },
  { title: 'Apocalypse Now', year: 1979, imdbId: 'tt0078788' },
  { title: 'The Sixth Sense', year: 1999, imdbId: 'tt0110912' },
  { title: 'Se7en', year: 1995, imdbId: 'tt0114369' },
  { title: 'Saving Private Ryan', year: 1998, imdbId: 'tt0120815' },
  { title: 'Forrest Gump', year: 1994, imdbId: 'tt0109830' },
  { title: 'Pulp Fiction', year: 1994, imdbId: 'tt0110912' },
  { title: 'The Matrix', year: 1999, imdbId: 'tt0133093' },
  { title: 'Fight Club', year: 1999, imdbId: 'tt0137523' },
  { title: 'Inception', year: 2010, imdbId: 'tt1375666' },
  { title: 'The Dark Knight', year: 2008, imdbId: 'tt0468569' },
  { title: 'The Prestige', year: 2006, imdbId: 'tt0482571' },
  { title: 'Memento', year: 2000, imdbId: 'tt0113997' },
  { title: 'Interstellar', year: 2014, imdbId: 'tt0816692' },
  { title: 'The Shawshank Redemption', year: 1994, imdbId: 'tt0111161' },
  { title: 'The Green Mile', year: 1999, imdbId: 'tt0120689' },
  { title: 'The Usual Suspects', year: 1995, imdbId: 'tt0114814' },
];

async function addClassics() {
  try {
    console.log(`Checking for missing classic films...\n`);

    // Get existing movies
    const { data: existing } = await supabase
      .from('movies')
      .select('title, year');
    
    const existingSet = new Set(existing?.map(m => `${m.title}|${m.year}`) || []);
    console.log(`Database has ${existing?.length} movies\n`);

    // Filter to only those not in database
    const missing = toAdd.filter(m => !existingSet.has(`${m.title}|${m.year}`));
    
    console.log(`Found ${missing.length} classic films to add:\n`);
    missing.slice(0, 20).forEach(m => {
      console.log(`  ${m.title} (${m.year})`);
    });
    if (missing.length > 20) {
      console.log(`  ... and ${missing.length - 20} more`);
    }

    if (missing.length > 0) {
      // Insert
      const { error } = await supabase
        .from('movies')
        .insert(missing.map(m => ({
          title: m.title,
          year: m.year,
          imdb_id: m.imdbId,
          poster_url: null,
          genres: [],
          director: null,
          runtime_minutes: null,
          plot: null
        })));

      if (error) {
        console.error('Insert error:', error.message);
      } else {
        console.log(`\n✅ Added ${missing.length} classic films`);
      }
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

addClassics();
