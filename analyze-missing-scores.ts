import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyze() {
  console.log('🔍 Analyzing unscored movies...\n');

  // Get all movies
  const { data: allMovies } = await supabase
    .from('movies')
    .select('id, title, year');

  // Get all scored movie IDs
  const { data: scored } = await supabase
    .from('movie_scores')
    .select('movie_id');

  const scoredSet = new Set((scored || []).map(s => s.movie_id));
  const unscored = (allMovies || []).filter(m => !scoredSet.has(m.id));

  console.log(`Total unscored movies: ${unscored.length}\n`);

  if (unscored.length === 0) {
    console.log('✨ All movies are scored!');
    return;
  }

  // Get score data for unscored movies to see what's missing
  const { data: unScoredData } = await supabase
    .from('movie_scores')
    .select('movie_id, imdb_rating, rt_tomatometer')
    .in('movie_id', unscored.map(m => m.id));

  const partialData = unScoredData || [];
  const hasIMDb = partialData.filter(s => s.imdb_rating && !s.rt_tomatometer).length;
  const hasRT = partialData.filter(s => s.rt_tomatometer && !s.imdb_rating).length;
  const hasNeither = unscored.length - hasIMDb - hasRT;

  console.log(`Breakdown of ${unscored.length} unscored movies:`);
  console.log(`  - Has IMDb only: ${hasIMDb}`);
  console.log(`  - Has RT only: ${hasRT}`);
  console.log(`  - Has neither: ${hasNeither}\n`);

  // Show samples
  if (hasNeither > 0) {
    console.log(`Sample unscored movies (need both RT + IMDb):`);
    unscored.slice(0, 10).forEach((m: any) => {
      console.log(`  - ${m.title} (${m.year})`);
    });
    if (unscored.length > 10) {
      console.log(`  ... and ${unscored.length - 10} more`);
    }
  }

  console.log(`\n📋 Plan to score all 288 unscored movies:`);
  console.log(`1. Fetch missing RT + IMDb from OMDB (288 API calls)`);
  console.log(`2. Calculate composite scores using v4 formula: (RT×0.5) + (IMDb×0.5)`);
  console.log(`3. Update database`);
  console.log(`\n⏱️  Estimated time: ~15 minutes (with 300ms delays)`);
  console.log(`💾 OMDB quota: ~288 calls (you have 1000/day free)`);
}

analyze();
