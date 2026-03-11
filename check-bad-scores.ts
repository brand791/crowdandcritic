import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Check A Beautiful Mind
    const { data: beautiful } = await supabase
      .from('movies')
      .select('id, title, year')
      .eq('title', 'A Beautiful Mind')
      .single();
    
    if (beautiful) {
      const { data: beautyScores } = await supabase
        .from('movie_scores')
        .select('*')
        .eq('movie_id', beautiful.id)
        .single();
      
      console.log('=== A BEAUTIFUL MIND ===');
      console.log(`Title: ${beautiful.title} (${beautiful.year})`);
      console.log(`RT: ${beautyScores?.rt_tomatometer}`);
      console.log(`IMDb: ${beautyScores?.imdb_rating}`);
      console.log(`Composite: ${beautyScores?.composite_score}`);
    }

    // Check Burn After Reading
    const { data: burn } = await supabase
      .from('movies')
      .select('id, title, year')
      .eq('title', 'Burn After Reading')
      .single();
    
    if (burn) {
      const { data: burnScores } = await supabase
        .from('movie_scores')
        .select('*')
        .eq('movie_id', burn.id)
        .single();
      
      console.log('\n=== BURN AFTER READING ===');
      console.log(`Title: ${burn.title} (${burn.year})`);
      console.log(`RT: ${burnScores?.rt_tomatometer}`);
      console.log(`IMDb: ${burnScores?.imdb_rating}`);
      console.log(`Composite: ${burnScores?.composite_score}`);
    }

    // Check all movies with score < 50
    console.log('\n=== ALL MOVIES WITH COMPOSITE < 50 ===');
    const { data: lowScores } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .lt('composite_score', 50)
      .order('composite_score', { ascending: false });
    
    console.log(`Found: ${lowScores?.length} movies\n`);
    lowScores?.slice(0, 20).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
