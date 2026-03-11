import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';
const supabase = createClient(supabaseUrl, supabaseKey);
const tmdbKey = 'f89d62b556a34bac6115257325b6271a';

// IMDb Top 250 manually curated list
const imdbTop250 = [
  { title: 'The Shawshank Redemption', year: 1994, imdbId: 'tt0111161' },
  { title: 'The Godfather', year: 1972, imdbId: 'tt0068646' },
  { title: 'The Dark Knight', year: 2008, imdbId: 'tt0468569' },
  { title: 'Pulp Fiction', year: 1994, imdbId: 'tt0110912' },
  { title: 'Schindler\'s List', year: 1993, imdbId: 'tt0108052' },
  { title: 'Inception', year: 2010, imdbId: 'tt1375666' },
  { title: 'The Matrix', year: 1999, imdbId: 'tt0133093' },
  { title: 'Goodfellas', year: 1990, imdbId: 'tt0099674' },
  { title: 'The Silence of the Lambs', year: 1991, imdbId: 'tt0102926' },
  { title: 'Se7en', year: 1995, imdbId: 'tt0114369' },
  { title: 'Saving Private Ryan', year: 1998, imdbId: 'tt0120815' },
  { title: 'Forrest Gump', year: 1994, imdbId: 'tt0109830' },
  { title: 'The Green Mile', year: 1999, imdbId: 'tt0120689' },
  { title: 'Interstellar', year: 2014, imdbId: 'tt0816692' },
  { title: 'The Usual Suspects', year: 1995, imdbId: 'tt0114814' },
  { title: 'Gladiator', year: 2000, imdbId: 'tt0172495' },
  { title: 'The Sixth Sense', year: 1999, imdbId: 'tt0110912' },
  { title: 'Fight Club', year: 1999, imdbId: 'tt0137523' },
  { title: 'The Prestige', year: 2006, imdbId: 'tt0482571' },
  { title: 'Memento', year: 2000, imdbId: 'tt0113997' },
  { title: 'Back to the Future', year: 1985, imdbId: 'tt0088763' },
  { title: 'The Last Temptation of Christ', year: 1988, imdbId: 'tt0095497' },
  { title: 'Taxi Driver', year: 1976, imdbId: 'tt0075314' },
  { title: '2001: A Space Odyssey', year: 1968, imdbId: 'tt0062622' },
  { title: 'Dr. Strangelove', year: 1964, imdbId: 'tt0057012' },
  { title: 'One Flew Over the Cuckoo\'s Nest', year: 1975, imdbId: 'tt0073486' },
  { title: 'The Shining', year: 1980, imdbId: 'tt0081505' },
  { title: 'The Empire Strikes Back', year: 1980, imdbId: 'tt0080684' },
  { title: 'Blade Runner', year: 1982, imdbId: 'tt0083658' },
  { title: 'Raiders of the Lost Ark', year: 1981, imdbId: 'tt0082971' },
  { title: 'Jaws', year: 1975, imdbId: 'tt0073195' },
  { title: 'Apocalypse Now', year: 1979, imdbId: 'tt0078788' },
  { title: 'Vertigo', year: 1958, imdbId: 'tt0052357' },
  { title: 'Rear Window', year: 1954, imdbId: 'tt0047396' },
  { title: 'Singin\' in the Rain', year: 1952, imdbId: 'tt0045152' },
  { title: 'Citizen Kane', year: 1941, imdbId: 'tt0033467' },
  { title: 'Casablanca', year: 1942, imdbId: 'tt0034583' },
  { title: 'Sunset Boulevard', year: 1950, imdbId: 'tt0043014' },
  { title: 'The Maltese Falcon', year: 1941, imdbId: 'tt0033856' },
  { title: 'The Third Man', year: 1949, imdbId: 'tt0041959' },
  { title: 'It\'s a Wonderful Life', year: 1946, imdbId: 'tt0038650' },
  { title: 'The Seventh Seal', year: 1957, imdbId: 'tt0050976' },
  { title: 'Breathless', year: 1960, imdbId: 'tt0053472' },
  { title: '400 Blows', year: 1959, imdbId: 'tt0053472' },
  { title: 'Bicycle Thieves', year: 1948, imdbId: 'tt0040522' },
  { title: 'The 400 Blows', year: 1959, imdbId: 'tt0053472' },
  { title: 'City Lights', year: 1931, imdbId: 'tt0021749' },
  { title: 'Metropolis', year: 1927, imdbId: 'tt0017136' },
  { title: 'Nosferatu', year: 1922, imdbId: 'tt0013442' },
];

async function addTop250() {
  try {
    console.log(`Adding IMDb Top 250 movies...\n`);

    // Check which ones already exist
    const existingTitles = new Set<string>();
    const { data: existing } = await supabase
      .from('movies')
      .select('title, year');
    
    existing?.forEach(m => {
      existingTitles.add(`${m.title}|${m.year}`);
    });

    console.log(`Current database has ${existing?.length} movies`);
    console.log(`Checking ${imdbTop250.length} IMDb Top 250 films...\n`);

    let added = 0;
    const toAdd: any[] = [];

    for (const movie of imdbTop250) {
      const key = `${movie.title}|${movie.year}`;
      if (!existingTitles.has(key)) {
        console.log(`Missing: ${movie.title} (${movie.year})`);
        toAdd.push({
          title: movie.title,
          year: movie.year,
          imdb_id: movie.imdbId,
          tmdb_id: null,
          poster_url: null,
          genres: [],
          director: null,
          runtime_minutes: null,
          plot: null
        });
        added++;
      }
    }

    console.log(`\n${added} movies need to be added\n`);

    if (toAdd.length > 0) {
      // Insert into database
      const { error } = await supabase
        .from('movies')
        .insert(toAdd);

      if (error) {
        console.error('Insert error:', error.message);
      } else {
        console.log(`✅ Added ${toAdd.length} movies to database`);
      }
    }

    console.log(`\nNew total: ${(existing?.length || 0) + toAdd.length} movies`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

addTop250();
