import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMarty() {
  try {
    // Get Marty Supreme from movies table
    const { data: marty } = await supabase
      .from('movies')
      .select('*')
      .eq('title', 'Marty Supreme')
      .single();
    
    console.log('=== MARTY SUPREME IN MOVIES TABLE ===');
    console.log(JSON.stringify(marty, null, 2));

    if (marty) {
      // Get its scores from movie_scores table
      const { data: scores } = await supabase
        .from('movie_scores')
        .select('*')
        .eq('movie_id', marty.id)
        .single();
      
      console.log('\n=== MARTY SUPREME SCORES ===');
      console.log(JSON.stringify(scores, null, 2));
    }

    // Also check the getTopMovies query that's used on homepage
    console.log('\n=== CHECKING QUERY USED IN HOMEPAGE ===');
    const { data: topMovies } = await supabase
      .from('movies')
      .select(`
        id,
        title,
        year,
        poster_url,
        movie_scores(rt_tomatometer, imdb_rating, composite_score)
      `)
      .gt('composite_score', 0)  // Only scored movies
      .order('composite_score', { ascending: false, foreignTable: 'movie_scores' })
      .limit(5);
    
    console.log('\nTop 5 movies from homepage query:');
    topMovies?.forEach((m: any) => {
      const scores = Array.isArray(m.movie_scores) ? m.movie_scores[0] : m.movie_scores;
      console.log(`${m.title} (${m.year}) - Composite: ${scores?.composite_score}`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

checkMarty();
