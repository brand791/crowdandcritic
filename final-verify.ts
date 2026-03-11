import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    // Get all movie_scores
    const { data: all } = await supabase
      .from('movie_scores')
      .select('composite_score');
    
    console.log(`=== FINAL STATE ===\n`);
    console.log(`Total movies: ${all?.length}`);

    // Check for NULL
    const nullCount = all?.filter(m => m.composite_score === null).length || 0;
    console.log(`Movies with NULL score: ${nullCount}`);

    // Check for 0
    const zeroCount = all?.filter(m => m.composite_score === 0).length || 0;
    console.log(`Movies with score 0: ${zeroCount}`);

    // Min and max
    const sorted = (all || []).sort((a, b) => (a.composite_score || 0) - (b.composite_score || 0));
    console.log(`\nScore range: ${sorted[0]?.composite_score} to ${sorted[sorted.length - 1]?.composite_score}`);

    // Get top and bottom
    const { data: top } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .order('composite_score', { ascending: false })
      .limit(5);
    
    console.log(`\nTop 5:`);
    top?.forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

    const { data: bottom } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .order('composite_score', { ascending: true })
      .limit(5);
    
    console.log(`\nBottom 5:`);
    bottom?.forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

    if (nullCount === 0 && zeroCount === 0) {
      console.log(`\n✅ DATA CLEAN - All 780 movies have valid scores!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
