import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  try {
    // Get a few records from movie_scores to see what columns exist
    const { data, error } = await supabase
      .from('movie_scores')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('=== MOVIE_SCORES SCHEMA (from first row) ===');
      console.log('Columns:', Object.keys(data[0]));
      console.log('\nSample row:');
      console.log(JSON.stringify(data[0], null, 2));
    }

    // Also check a sample movie
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select('*')
      .limit(1);
    
    if (moviesError) {
      console.log('Movies Error:', moviesError.message);
    } else if (movies && movies.length > 0) {
      console.log('\n=== MOVIES SCHEMA (from first row) ===');
      console.log('Columns:', Object.keys(movies[0]));
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

checkSchema();
