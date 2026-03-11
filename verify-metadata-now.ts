import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('director, genres, poster_url');

    const withDirector = allMovies?.filter(m => m.director)?.length || 0;
    const withGenres = allMovies?.filter(m => Array.isArray(m.genres) && m.genres.length > 0)?.length || 0;
    const withPoster = allMovies?.filter(m => m.poster_url)?.length || 0;

    console.log(`=== METADATA STATUS (LIVE) ===\n`);
    console.log(`Directors: ${withDirector}/999 (${((withDirector / 999) * 100).toFixed(1)}%)`);
    console.log(`Genres: ${withGenres}/999 (${((withGenres / 999) * 100).toFixed(1)}%)`);
    console.log(`Posters: ${withPoster}/999 (${((withPoster / 999) * 100).toFixed(1)}%)`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
