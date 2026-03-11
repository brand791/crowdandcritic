import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Get Marty Supreme movie_scores directly
    const { data } = await supabase
      .from('movies')
      .select('id, title, year')
      .eq('title', 'Marty Supreme')
      .single();
    
    console.log('Marty Supreme movie record:', data);

    if (data) {
      const { data: scores } = await supabase
        .from('movie_scores')
        .select('*')
        .eq('movie_id', data.id)
        .single();
      
      console.log('\nMarty Supreme scores:');
      console.log(`  RT: ${scores?.rt_tomatometer}%`);
      console.log(`  IMDb: ${scores?.imdb_rating}/10`);
      console.log(`  Composite: ${scores?.composite_score}`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
