import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMovies() {
  try {
    // Search for Marty Supreme
    console.log('=== SEARCHING FOR MARTY SUPREME ===');
    const { data: marty } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', '%Marty%Supreme%');
    
    if (marty && marty.length > 0) {
      console.log('Found:');
      marty.forEach((m: any) => console.log(`  ${m.title} (${m.year})`));
    } else {
      console.log('Not found - checking similar titles...');
      const { data: similar } = await supabase
        .from('movies')
        .select('*')
        .ilike('title', '%Marty%')
        .limit(5);
      if (similar && similar.length > 0) {
        console.log('Movies with "Marty":');
        similar.forEach((m: any) => console.log(`  ${m.title} (${m.year})`));
      }
    }

    // Check movies that have RT/IMDb but NULL composite score
    console.log('\n=== MOVIES WITH RT/IMDb SCORES BUT NULL COMPOSITE ===');
    const { data: missingComposite } = await supabase
      .from('movies')
      .select(`
        id,
        title,
        year,
        movie_scores(rt_tomatometer, imdb_rating, composite_score)
      `)
      .is('composite_score', null)
      .order('created_at', { ascending: false })
      .limit(15);
    
    let foundMissing = 0;
    if (missingComposite) {
      missingComposite.forEach((m: any) => {
        const scores = Array.isArray(m.movie_scores) ? m.movie_scores[0] : m.movie_scores;
        // Only show if both RT and IMDb exist but composite is null
        if (scores && scores.rt_tomatometer && scores.imdb_rating && !scores.composite_score) {
          console.log(`${m.title} (${m.year}) - RT: ${scores.rt_tomatometer}%, IMDb: ${scores.imdb_rating}`);
          foundMissing++;
        }
      });
    }
    console.log(`Total with scores but no composite: ${foundMissing}`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

checkMovies();
