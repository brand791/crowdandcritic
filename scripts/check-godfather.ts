import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rlnkmresgszqiyaamcfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o'
);

async function check() {
  // Get all Godfather movies
  const { data: godfather } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(*)')
    .eq('title', 'The Godfather');

  console.log(`Found ${godfather?.length} Godfather movie(s)\n`);

  godfather?.forEach(m => {
    const s = m.movie_scores as any;
    console.log(`${m.title} (${m.year}):`);
    console.log(`  Critic: ${s.critic_score?.toFixed(1) || 'NULL'} (RT: ${s.rt_tomatometer || 'NULL'}, MC: ${s.metacritic_score || 'NULL'})`);
    console.log(`  Audience: ${s.audience_score?.toFixed(1) || 'NULL'} (IMDb: ${s.imdb_rating || 'NULL'}, RT Aud: ${s.rt_audience || 'NULL'}, MC User: ${s.metacritic_user || 'NULL'})`);
    console.log(`  Canon: ${s.canon_appearances || 'NULL'} appearances → score ${((s.canon_appearances || 0) / 15 * 100).toFixed(1)}`);
    console.log(`  Popularity: ${s.popularity_weight || 'NULL'}`);
    console.log(`  Longevity: ${s.longevity_bonus || 'NULL'}`);
    console.log(`  COMPOSITE: ${s.composite_score?.toFixed(1) || 'NULL'}\n`);
  });

  // Check what ranks highest
  const { data: topTen } = await supabase
    .from('movies')
    .select('title, year, movie_scores(composite_score, canon_appearances)')
    .order('title')
    .limit(501);

  const sorted = (topTen || [])
    .map(m => ({
      title: m.title,
      year: (m.movie_scores as any)?.year,
      score: (m.movie_scores as any)?.composite_score,
      canon: (m.movie_scores as any)?.canon_appearances,
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 20);

  console.log('\nTop 20 by composite score:');
  sorted.forEach((m, i) => {
    console.log(`${(i+1).toString().padStart(2)}. ${m.title.padEnd(40)} (${m.canon || 0} canon) → ${m.score?.toFixed(1)}`);
  });
}

check().catch(console.error);
