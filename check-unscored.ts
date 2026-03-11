import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUnscored() {
  try {
    // Find movies with RT AND IMDb but NULL composite
    const { data: needsScoring } = await supabase
      .from('movie_scores')
      .select(`
        movie_id,
        rt_tomatometer,
        imdb_rating,
        composite_score,
        movies(title, year)
      `)
      .is('composite_score', null)
      .not('rt_tomatometer', 'is', null)
      .not('imdb_rating', 'is', null);
    
    console.log(`=== MOVIES NEEDING COMPOSITE SCORE CALCULATION ===`);
    console.log(`Found: ${needsScoring?.length || 0} movies\n`);
    
    if (needsScoring && needsScoring.length > 0) {
      console.log('Movies to fix:');
      needsScoring.slice(0, 20).forEach((s: any) => {
        const m = Array.isArray(s.movies) ? s.movies[0] : s.movies;
        console.log(`  ${m.title} (${m.year}) - RT: ${s.rt_tomatometer}%, IMDb: ${s.imdb_rating}/10`);
      });
      if (needsScoring.length > 20) {
        console.log(`  ... and ${needsScoring.length - 20} more`);
      }
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

checkUnscored();
