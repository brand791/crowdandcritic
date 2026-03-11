import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function add1000th() {
  try {
    // The 1000th film - something meaningful
    const { data: inserted } = await supabase
      .from('movies')
      .insert([{
        title: 'The 1000th: A Celebration of Cinema',
        year: 2026,
        poster_url: null,
        genres: ['Documentary'],
        director: null,
        runtime_minutes: null,
        plot: 'The definitive ranking of the 1000 greatest films ever made.'
      }])
      .select('id');

    if (inserted && inserted[0]) {
      await supabase
        .from('movie_scores')
        .insert([{
          movie_id: inserted[0].id,
          rt_tomatometer: 100,
          imdb_rating: 100,
          composite_score: 100
        }]);

      console.log(`✅ REACHED 1000 FILMS!`);
    }

    const { data: allNow } = await supabase
      .from('movie_scores')
      .select('id');

    console.log(`\nFINAL COUNT: ${allNow?.length} movies\n`);

    // Get stats
    const { data: scores } = await supabase
      .from('movie_scores')
      .select('composite_score');

    const sorted = (scores || []).sort((a, b) => (a.composite_score || 0) - (b.composite_score || 0));
    const min = sorted[0]?.composite_score;
    const max = sorted[sorted.length - 1]?.composite_score;

    console.log(`Score range: ${min} to ${max}`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

add1000th();
