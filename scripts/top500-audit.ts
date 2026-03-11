import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// AFI Top 100 American Films
const afiTop100 = [
  'Citizen Kane', 'Godfather', 'Casablanca', 'Raging Bull', 'Singin\' in the Rain',
  'Gone with the Wind', 'Lawrence of Arabia', 'Schindler\'s List', 'Vertigo', 'The Wizard of Oz',
  'The Godfather Part II', 'One Flew Over the Cuckoo\'s Nest', 'Sunrise', 'All the King\'s Men', 'It\'s a Wonderful Life',
  'Sunset Boulevard', 'The Graduate', 'Psycho', 'Jaws', 'Chinatown',
  'The Searchers', 'Singin\' in the Rain', 'Forrest Gump', 'Pulp Fiction', 'Some Like It Hot',
  'Rear Window', 'Taxi Driver', 'Rebel Without a Cause', 'North by Northwest', 'Vertigo',
  'The Silence of the Lambs', 'The Shining', 'Saving Private Ryan', 'Grease', 'Goodfellas',
  'Singin\' in the Rain', 'American Beauty', 'West Side Story', 'Shrek', 'The Sixth Sense',
  '2001: A Space Odyssey', 'The Manchurian Candidate', 'Alien', 'Jaws', 'Snow White and the Seven Dwarfs',
  'Apocalypse Now', 'The Best Years of Our Lives', 'The Bridge on the River Kwai', 'An American in Paris', 'Singin\' in the Rain',
  'Swing Time', 'A Streetcar Named Desire', 'Butch Cassidy and the Sundance Kid', 'Breakfast at Tiffany\'s', 'Singin\' in the Rain',
  'Blade Runner', 'Amadeus', 'All About Eve', 'Toy Story', 'The Poseidon Adventure',
  'Sense and Sensibility', 'Spirited Away', 'Metropolis', 'Nosferatu', 'Battleship Potemkin',
];

// IMDb Top 250 (sample - key ones)
const imdbTop = [
  'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Pulp Fiction', 'The Godfather Part II',
  'Schindler\'s List', 'Inception', 'Fight Club', 'The Dark Knight Rises', 'Forrest Gump',
  'The Good, the Bad and the Ugly', 'The Silence of the Lambs', 'Se7en', 'The Matrix', 'Saving Private Ryan',
  'Interstellar', 'Parasite', 'Memento', 'The Sixth Sense', 'Gladiator',
  'The Green Mile', 'The Usual Suspects', 'Jaws', 'The Lion King', 'Goodfellas',
  '12 Angry Men', 'Harakiri', 'Back to the Future', 'Grave of the Fireflies', 'Seven Samurai',
];

// Sight & Sound Top 100 (key ones)
const sightAndSound = [
  'Battleship Potemkin', 'Tokyo Story', 'Rules of the Game', 'Singin\' in the Rain', 'Citizen Kane',
  'The 400 Blows', 'Rope', 'Casablanca', 'Metropolis', 'Breathless',
  'Tokyo Story', 'Viaggio in Italia', 'Playtime', 'Stalker', 'Ikiru',
];

async function auditTop500() {
  try {
    // Get all movies in database
    const { data: allMovies } = await supabase
      .from('movies')
      .select('title, year');

    const dbSet = new Set(allMovies?.map(m => m.title.toLowerCase()) || []);
    
    console.log(`=== TOP 500 AUDIT ===\n`);
    console.log(`Current database: ${allMovies?.length} movies\n`);

    // Check AFI coverage
    const afiMissing = afiTop100.filter(t => !dbSet.has(t.toLowerCase()));
    console.log(`AFI Top 100 - Missing: ${afiMissing.length}/${afiTop100.length}`);
    if (afiMissing.length > 0) {
      console.log(`  Examples: ${afiMissing.slice(0, 10).join(', ')}`);
    }

    // Check IMDb coverage
    const imdbMissing = imdbTop.filter(t => !dbSet.has(t.toLowerCase()));
    console.log(`\nIMDb Top 250 (sampled) - Missing: ${imdbMissing.length}/${imdbTop.length}`);
    if (imdbMissing.length > 0) {
      console.log(`  Examples: ${imdbMissing.slice(0, 10).join(', ')}`);
    }

    // Check Sight & Sound coverage
    const ssMissing = sightAndSound.filter(t => !dbSet.has(t.toLowerCase()));
    console.log(`\nSight & Sound Top 100 - Missing: ${ssMissing.length}/${sightAndSound.length}`);
    if (ssMissing.length > 0) {
      console.log(`  Examples: ${ssMissing.slice(0, 10).join(', ')}`);
    }

    console.log(`\n=== COVERAGE ANALYSIS ===`);
    const totalCanonical = new Set([...afiTop100, ...imdbTop, ...sightAndSound]);
    const missing = Array.from(totalCanonical).filter(t => !dbSet.has(t.toLowerCase()));
    
    console.log(`Canonical "Greatest Films" lists: ${totalCanonical.size}`);
    console.log(`Already in database: ${totalCanonical.size - missing.length}`);
    console.log(`Missing: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log(`\nShould add:${missing.slice(0, 30).map(m => `\n  - ${m}`).join('')}`);
      if (missing.length > 30) {
        console.log(`  ... and ${missing.length - 30} more`);
      }
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

auditTop500();
