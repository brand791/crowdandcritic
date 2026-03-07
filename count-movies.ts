import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function countMovies() {
  // Total movies
  const { count: total } = await supabase
    .from('movies')
    .select('*', { count: 'exact', head: true });

  // Movies with scores
  const { count: scored } = await supabase
    .from('movie_scores')
    .select('*', { count: 'exact', head: true });

  // Movies with IMDb 7.0+
  const { data: imdb70 } = await supabase
    .from('movie_scores')
    .select('*')
    .gte('imdb_rating', 7.0);

  // Movies with RT 80+
  const { data: rt80 } = await supabase
    .from('movie_scores')
    .select('*')
    .gte('rt_tomatometer', 80);

  console.log(`Total movies: ${total}`);
  console.log(`With scores: ${scored}`);
  console.log(`IMDb 7.0+: ${imdb70?.length}`);
  console.log(`RT 80%+: ${rt80?.length}`);
  
  const either = new Set([
    ...(imdb70?.map((m: any) => m.movie_id) || []),
    ...(rt80?.map((m: any) => m.movie_id) || []),
  ]);
  
  console.log(`Either criterion: ${either.size}`);
}

countMovies();
