import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Get count of movies by score range
    const { data: allScores } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .order('composite_score', { ascending: true });
    
    console.log(`=== ALL MOVIES SORTED BY COMPOSITE SCORE (ASCENDING) ===\n`);
    console.log(`Total: ${allScores?.length}\n`);

    // Show first 30
    console.log('First 30 (lowest scores):');
    allScores?.slice(0, 30).forEach((m: any, idx: number) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`${idx+1}. ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

    console.log('\n...\n');

    // Show last 30
    console.log('Last 30 (highest scores):');
    allScores?.slice(-30).forEach((m: any, idx: number) => {
      const total = allScores.length;
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`${total - 29 + idx}. ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
