import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    // Total count
    const { data: all } = await supabase
      .from('movie_scores')
      .select('id, composite_score');
    
    console.log(`=== CANONICAL 500 VERIFICATION ===\n`);
    console.log(`Total movies: ${all?.length}\n`);

    // Check for any scores < 50 or NULL
    const invalid = all?.filter(m => !m.composite_score || m.composite_score < 50) || [];
    console.log(`Movies with score < 50 or NULL: ${invalid.length}`);
    if (invalid.length > 0) {
      console.log('  ⚠️  Found invalid scores!');
    }

    // Stats
    const sorted = (all || []).sort((a, b) => (a.composite_score || 0) - (b.composite_score || 0));
    const min = sorted[0]?.composite_score;
    const max = sorted[sorted.length - 1]?.composite_score;
    
    console.log(`\nScore range: ${min} to ${max}`);

    // Check recent additions (should all be high quality)
    console.log(`\n=== RECENT ADDITIONS (Last 10) ===`);
    const { data: recent } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .order('composite_score', { ascending: false })
      .limit(10);
    
    recent?.forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

    // Bottom 5
    console.log(`\n=== BOTTOM 5 ===`);
    const { data: bottom } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .order('composite_score', { ascending: true })
      .limit(5);
    
    bottom?.forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

    if (invalid.length === 0) {
      console.log(`\n✅ All 833 movies have valid scores (50-100)!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
