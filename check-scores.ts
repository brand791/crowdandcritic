import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMovies() {
  try {
    // Check Marty Supreme specifically
    const { data: marty, error: martyError } = await supabase
      .from('movies')
      .select('id, title, year, composite_score, movie_scores(rt_score, imdb_score)')
      .ilike('title', '%Marty Supreme%');
    
    console.log('=== MARTY SUPREME ===');
    if (martyError) console.log('Error:', martyError.message);
    if (marty && marty.length > 0) {
      console.log('Found:', marty.length, 'movies');
      marty.forEach((m: any) => {
        const scores = Array.isArray(m.movie_scores) ? m.movie_scores[0] : m.movie_scores;
        console.log(`${m.title} (${m.year})`);
        console.log(`  Composite: ${m.composite_score}`);
        console.log(`  RT: ${scores?.rt_score}, IMDb: ${scores?.imdb_score}`);
      });
    } else {
      console.log('Not found in database');
    }

    // Check last 10 movies with null composite_score
    const { data: nullScores, error: nullError } = await supabase
      .from('movies')
      .select('id, title, year, composite_score, movie_scores(rt_score, imdb_score)')
      .is('composite_score', null)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log('\n=== MOVIES WITH NULL COMPOSITE SCORE (last 10 added) ===');
    if (nullError) console.log('Error:', nullError.message);
    if (nullScores && nullScores.length > 0) {
      console.log('Count:', nullScores.length);
      nullScores.forEach((m: any) => {
        const scores = Array.isArray(m.movie_scores) ? m.movie_scores[0] : m.movie_scores;
        console.log(`${m.title} (${m.year}) - RT: ${scores?.rt_score}, IMDb: ${scores?.imdb_score}`);
      });
    } else {
      console.log('All movies have scores!');
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

checkMovies();
