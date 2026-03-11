import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data } = await supabase
      .from('movie_scores')
      .select('rt_tomatometer, imdb_rating')
      .not('imdb_rating', 'is', null)
      .limit(5);
    
    console.log('Sample IMDb values from database:');
    data?.forEach(d => {
      console.log(`  RT: ${d.rt_tomatometer}, IMDb: ${d.imdb_rating} (type: ${typeof d.imdb_rating})`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
