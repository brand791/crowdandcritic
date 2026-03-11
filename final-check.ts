import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Check A Beautiful Mind
    const { data: beautiful } = await supabase
      .from('movie_scores')
      .select('rt_tomatometer, imdb_rating, composite_score, movies(title, year)')
      .eq('movies.title', 'A Beautiful Mind')
      .single();
    
    const bm = Array.isArray(beautiful?.movies) ? beautiful.movies[0] : beautiful?.movies;
    console.log(`A Beautiful Mind: RT ${beautiful?.rt_tomatometer}% + IMDb ${beautiful?.imdb_rating}% = ${beautiful?.composite_score}`);

    // Check Burn After Reading
    const { data: burn } = await supabase
      .from('movie_scores')
      .select('rt_tomatometer, imdb_rating, composite_score, movies(title, year)')
      .eq('movies.title', 'Burn After Reading')
      .single();
    
    const burm = Array.isArray(burn?.movies) ? burn.movies[0] : burn?.movies;
    console.log(`Burn After Reading: RT ${burn?.rt_tomatometer}% + IMDb ${burn?.imdb_rating}% = ${burn?.composite_score}`);

    // Check how many movies are < 50
    const { data: lowScores } = await supabase
      .from('movie_scores')
      .select('composite_score')
      .not('composite_score', 'is', null)
      .lt('composite_score', 50);
    
    console.log(`\nMovies with composite < 50: ${lowScores?.length}`);

    // List them
    console.log('\nLow-scoring movies:');
    const { data: list } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .lt('composite_score', 50)
      .order('composite_score', { ascending: false });
    
    list?.slice(0, 15).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
