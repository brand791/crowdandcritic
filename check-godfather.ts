import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, anonKey);

async function check() {
  console.log('Checking Godfather scores in database...\n');

  const { data, error } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(*)')
    .eq('title', 'The Godfather')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Movie:', data.title, `(${data.year})`);
  console.log('\nScore Data:');
  const score = data.movie_scores as any;
  console.log('  - Critic Score:', score?.critic_score);
  console.log('  - Audience Score:', score?.audience_score);
  console.log('  - Canon Score:', score?.canon_score);
  console.log('  - Longevity Bonus:', score?.longevity_bonus);
  console.log('  - Popularity Weight:', score?.popularity_weight);
  console.log('  - Composite Score:', score?.composite_score);
  
  console.log('\nRaw Scores:');
  console.log('  - RT Tomatometer:', score?.rt_tomatometer);
  console.log('  - Metacritic:', score?.metacritic_score);
  console.log('  - IMDb:', score?.imdb_rating);
  console.log('  - RT Audience:', score?.rt_audience);
  console.log('  - Metacritic User:', score?.metacritic_user);
  console.log('  - Canon Appearances:', score?.canon_appearances);
}

check().catch(console.error);
