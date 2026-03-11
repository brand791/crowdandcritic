import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    // Check Marty Supreme
    const { data } = await supabase
      .from('movie_scores')
      .select(`
        rt_tomatometer,
        imdb_rating,
        composite_score,
        movies(title, year)
      `)
      .eq('movies.title', 'Marty Supreme')
      .single();
    
    const m = data?.movies ? (Array.isArray(data.movies) ? data.movies[0] : data.movies) : null;
    
    console.log(`=== MARTY SUPREME VERIFICATION ===`);
    console.log(`Title: ${m?.title} (${m?.year})`);
    console.log(`RT: ${data?.rt_tomatometer}%`);
    console.log(`IMDb: ${data?.imdb_rating}/10`);
    console.log(`Composite Score: ${data?.composite_score}`);
    
    // Verify the calculation
    const rt = data?.rt_tomatometer || 0;
    const imdb = (data?.imdb_rating || 0) * 10;
    const expected = (rt * 0.5) + (imdb * 0.5);
    console.log(`\nExpected calculation: (${rt} × 0.5) + (${imdb} × 0.5) = ${expected}`);

    // Check a few more
    console.log(`\n=== SAMPLE OF FIXED MOVIES ===`);
    const { data: samples } = await supabase
      .from('movie_scores')
      .select(`
        rt_tomatometer,
        imdb_rating,
        composite_score,
        movies(title, year)
      `)
      .not('composite_score', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5);
    
    samples?.forEach((s: any) => {
      const mov = Array.isArray(s.movies) ? s.movies[0] : s.movies;
      const rt = s.rt_tomatometer;
      const imdb = s.imdb_rating;
      const calc = (rt * 0.5) + (imdb * 10 * 0.5);
      console.log(`${mov.title}: RT ${rt}% + IMDb ${imdb}/10 = ${s.composite_score} (expected: ${calc})`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
