import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rlnkmresgszqiyaamcfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y'
);

async function test() {
  // Check movie_scores directly
  const { data: scores, error: e1 } = await supabase
    .from('movie_scores')
    .select('id, movie_id')
    .limit(5);

  console.log('Movie Scores count:', scores?.length);
  console.log('First few scores:', scores);

  // Check movies with nested scores
  const { data: movies, error: e2 } = await supabase
    .from('movies')
    .select('id, title, movie_scores(*)')
    .limit(1);

  console.log('\nMovies with nested scores:', JSON.stringify(movies, null, 2));
}

test();
