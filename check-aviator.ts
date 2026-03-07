import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAviator() {
  // Check if The Aviator is in the database
  const { data: movies } = await supabase
    .from('movies')
    .select('id, title, year, director, movie_scores(composite_score, imdb_rating, rt_tomatometer)')
    .ilike('title', '%aviator%');

  console.log(`Found ${movies?.length || 0} movies matching "aviator"`);
  
  if (movies && movies.length > 0) {
    movies.forEach((m: any) => {
      const scores: any = m.movie_scores;
      console.log(`\n${m.title} (${m.year})`);
      console.log(`  Director: ${m.director}`);
      console.log(`  IMDb: ${scores?.[0]?.imdb_rating}`);
      console.log(`  RT: ${scores?.[0]?.rt_tomatometer}`);
      console.log(`  Composite: ${scores?.[0]?.composite_score}`);
    });
  } else {
    console.log('The Aviator NOT found in database');
  }

  // Check total movie count
  const { count } = await supabase
    .from('movies')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nTotal movies in DB: ${count}`);
}

checkAviator();
