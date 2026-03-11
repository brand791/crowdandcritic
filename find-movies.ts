import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3p6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function find() {
  try {
    // Search for A Beautiful Mind
    const { data: beautifulMovies } = await supabase
      .from('movies')
      .select('id, title, year')
      .ilike('title', '%Beautiful%Mind%');
    
    console.log('=== A BEAUTIFUL MIND SEARCH ===');
    beautifulMovies?.forEach(m => console.log(`  ${m.title} (${m.year}) - ${m.id}`));

    if (beautifulMovies && beautifulMovies.length > 0) {
      for (const m of beautifulMovies) {
        const { data: scores } = await supabase
          .from('movie_scores')
          .select('rt_tomatometer, imdb_rating, composite_score')
          .eq('movie_id', m.id)
          .single();
        console.log(`  Scores: RT ${scores?.rt_tomatometer}%, IMDb ${scores?.imdb_rating}%, Composite ${scores?.composite_score}`);
      }
    }

    // Search for Burn After Reading
    const { data: burnMovies } = await supabase
      .from('movies')
      .select('id, title, year')
      .ilike('title', '%Burn%Reading%');
    
    console.log('\n=== BURN AFTER READING SEARCH ===');
    burnMovies?.forEach(m => console.log(`  ${m.title} (${m.year}) - ${m.id}`));

    if (burnMovies && burnMovies.length > 0) {
      for (const m of burnMovies) {
        const { data: scores } = await supabase
          .from('movie_scores')
          .select('rt_tomatometer, imdb_rating, composite_score')
          .eq('movie_id', m.id)
          .single();
        console.log(`  Scores: RT ${scores?.rt_tomatometer}%, IMDb ${scores?.imdb_rating}%, Composite ${scores?.composite_score}`);
      }
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

find();
