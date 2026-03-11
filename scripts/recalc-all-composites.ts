import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function recalcAll() {
  try {
    // Get ALL movie_scores with RT and IMDb
    const { data: allScores } = await supabase
      .from('movie_scores')
      .select('id, rt_tomatometer, imdb_rating, composite_score')
      .not('rt_tomatometer', 'is', null)
      .not('imdb_rating', 'is', null);
    
    if (!allScores || allScores.length === 0) {
      console.log('No movies with both RT and IMDb');
      process.exit(0);
    }

    console.log(`Recalculating ${allScores.length} composite scores...\n`);

    // Recalculate using CORRECT formula
    const updates = allScores.map((s: any) => {
      const rt = s.rt_tomatometer;  // 0-100
      const imdb = s.imdb_rating;   // 0-100
      
      // v4: (RT × 0.50) + (IMDb × 0.50)
      const composite = (rt * 0.5) + (imdb * 0.5);
      
      return {
        id: s.id,
        composite_score: Math.round(composite * 10) / 10,
        rt,
        imdb,
        old: s.composite_score
      };
    });

    // Show first 10 for verification
    console.log('Sample recalculations:');
    updates.slice(0, 10).forEach(u => {
      const newVal = u.composite_score;
      const oldVal = u.old;
      const status = newVal === oldVal ? '✓' : '⚠️';
      console.log(`  ${status} RT ${u.rt}% + IMDb ${u.imdb}% = ${newVal} (was ${oldVal})`);
    });

    // Apply updates in batches
    const batchSize = 100;
    let updated = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const { error } = await supabase
        .from('movie_scores')
        .upsert(
          batch.map(u => ({ id: u.id, composite_score: u.composite_score })),
          { onConflict: 'id' }
        );

      if (error) {
        console.error(`Batch ${Math.ceil((i+1)/batchSize)} error:`, error.message);
      } else {
        updated += batch.length;
        console.log(`✓ Updated ${updated}/${updates.length}`);
      }
    }

    console.log(`\n✅ Recalculated ${updated} composite scores!`);

    // Verify A Beautiful Mind and Burn After Reading
    console.log('\n=== VERIFICATION ===');
    const { data: beautiful } = await supabase
      .from('movie_scores')
      .select('rt_tomatometer, imdb_rating, composite_score, movies(title, year)')
      .eq('movies.title', 'A Beautiful Mind')
      .single();
    
    if (beautiful) {
      const m = Array.isArray(beautiful.movies) ? beautiful.movies[0] : beautiful.movies;
      console.log(`A Beautiful Mind: (${beautiful.rt_tomatometer}×0.5) + (${beautiful.imdb_rating}×0.5) = ${beautiful.composite_score}`);
    }

    const { data: burn } = await supabase
      .from('movie_scores')
      .select('rt_tomatometer, imdb_rating, composite_score, movies(title, year)')
      .eq('movies.title', 'Burn After Reading')
      .single();
    
    if (burn) {
      const m = Array.isArray(burn.movies) ? burn.movies[0] : burn.movies;
      console.log(`Burn After Reading: (${burn.rt_tomatometer}×0.5) + (${burn.imdb_rating}×0.5) = ${burn.composite_score}`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

recalcAll();
