import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    console.log(`=== CHECKING FOR NULL/MISSING METADATA ===\n`);

    // Check for null directors
    const { data: nullDirectors } = await supabase
      .from('movies')
      .select('id, title, year')
      .is('director', null);
    
    console.log(`1. NULL directors: ${nullDirectors?.length}`);
    nullDirectors?.slice(0, 10).forEach(m => {
      console.log(`   - ${m.title} (${m.year})`);
    });

    // Check for null genres or empty array
    const { data: nullGenres } = await supabase
      .from('movies')
      .select('id, title, year, genres')
      .is('genres', null);
    
    console.log(`\n2. NULL genres: ${nullGenres?.length}`);

    // Check for missing posters
    const { data: nullPosters } = await supabase
      .from('movies')
      .select('id, title, year')
      .is('poster_url', null);
    
    console.log(`\n3. NULL poster_url: ${nullPosters?.length}`);
    nullPosters?.slice(0, 10).forEach(m => {
      console.log(`   - ${m.title} (${m.year})`);
    });

    // Sample some of the null director movies
    console.log(`\n=== SAMPLE NULL DIRECTOR MOVIES ===`);
    nullDirectors?.slice(0, 5).forEach(m => {
      console.log(`\n${m.title} (${m.year})`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
