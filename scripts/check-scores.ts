import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rlnkmresgszqiyaamcfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o'
);

async function check() {
  // Check Chinatown
  const { data: chinatown } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(*)')
    .eq('title', 'Chinatown')
    .single();

  console.log('CHINATOWN:');
  const ct_scores = chinatown?.movie_scores as any;
  console.log(`  Critic Score: ${ct_scores?.critic_score ?? 'NULL'}`);
  console.log(`  RT Tomatometer: ${ct_scores?.rt_tomatometer ?? 'NULL'}`);
  console.log(`  Metacritic: ${ct_scores?.metacritic_score ?? 'NULL'}`);
  console.log(`  Audience Score: ${ct_scores?.audience_score ?? 'NULL'}`);
  console.log(`  IMDb Rating: ${ct_scores?.imdb_rating ?? 'NULL'}`);
  console.log(`  RT Audience: ${ct_scores?.rt_audience ?? 'NULL'}`);
  console.log(`  Composite: ${ct_scores?.composite_score ?? 'NULL'}\n`);

  // Check Godfather
  const { data: godfather } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(*)')
    .eq('title', 'The Godfather')
    .single();

  console.log('THE GODFATHER:');
  const gf_scores = godfather?.movie_scores as any;
  console.log(`  Critic Score: ${gf_scores?.critic_score ?? 'NULL'}`);
  console.log(`  RT Tomatometer: ${gf_scores?.rt_tomatometer ?? 'NULL'}`);
  console.log(`  Metacritic: ${gf_scores?.metacritic_score ?? 'NULL'}`);
  console.log(`  Audience Score: ${gf_scores?.audience_score ?? 'NULL'}`);
  console.log(`  IMDb Rating: ${gf_scores?.imdb_rating ?? 'NULL'}`);
  console.log(`  RT Audience: ${gf_scores?.rt_audience ?? 'NULL'}`);
  console.log(`  Canon Score: ${gf_scores?.canon_appearances ?? 'NULL'}`);
  console.log(`  Composite: ${gf_scores?.composite_score ?? 'NULL'}\n`);

  // Count how many have null critic scores
  const { data: allScores } = await supabase
    .from('movie_scores')
    .select('rt_tomatometer, metacritic_score, imdb_rating, rt_audience, metacritic_user, movies(title)');

  const nullCritic = allScores?.filter(s => !s.rt_tomatometer && !s.metacritic_score).length;
  const nullAudience = allScores?.filter(s => !s.imdb_rating && !s.rt_audience && !s.metacritic_user).length;

  console.log('DATA COMPLETENESS:');
  console.log(`  Total movies: ${allScores?.length}`);
  console.log(`  Missing critic scores: ${nullCritic} (${((nullCritic || 0) / (allScores?.length || 1) * 100).toFixed(1)}%)`);
  console.log(`  Missing audience scores: ${nullAudience} (${((nullAudience || 0) / (allScores?.length || 1) * 100).toFixed(1)}%)`);
}

check().catch(console.error);
