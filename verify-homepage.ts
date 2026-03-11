import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    // This is the query used by the homepage (getTopMovies)
    const { data: topMovies } = await supabase
      .from('movies')
      .select(`
        id,
        title,
        year,
        poster_url,
        movie_scores(rt_tomatometer, imdb_rating, composite_score)
      `)
      .gt('composite_score', 0)
      .order('composite_score', { ascending: false, foreignTable: 'movie_scores' })
      .limit(20);
    
    console.log(`=== HOMEPAGE TOP 20 MOVIES (gt composite_score 0) ===\n`);
    
    topMovies?.forEach((m: any, idx: number) => {
      const scores = Array.isArray(m.movie_scores) ? m.movie_scores[0] : m.movie_scores;
      console.log(`${idx+1}. ${m.title} (${m.year}): ${scores?.composite_score}`);
    });

    console.log(`\n✅ Total scored movies: ${topMovies?.length || 0}`);

    // Check if Marty Supreme is in there
    const martyInList = topMovies?.some((m: any) => m.title === 'Marty Supreme');
    console.log(`Marty Supreme visible: ${martyInList ? '✅ YES' : '❌ NO'}`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
