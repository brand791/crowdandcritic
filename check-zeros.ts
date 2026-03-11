import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Count movies with score = 0
    const { data: zeros } = await supabase
      .from('movie_scores')
      .select('id, composite_score, movies(title, year)')
      .eq('composite_score', 0)
      .order('composite_score', { ascending: false });
    
    console.log(`=== MOVIES WITH COMPOSITE_SCORE = 0 ===`);
    console.log(`Found: ${zeros?.length}\n`);
    
    zeros?.slice(0, 20).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

    if (zeros && zeros.length > 20) {
      console.log(`  ... and ${zeros.length - 20} more`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
