import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Simple query - just top movies without complex filtering
    const { data, error } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .gt('composite_score', 0)
      .order('composite_score', { ascending: false })
      .limit(20);
    
    console.log('Error:', error?.message);
    console.log(`Found ${data?.length} movies with composite_score > 0\n`);
    
    data?.slice(0, 10).forEach((m: any, idx: number) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`${idx+1}. ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
