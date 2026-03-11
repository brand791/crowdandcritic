import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCompositeScores() {
  try {
    // Get all movies with RT + IMDb but NULL composite
    const { data: needsScoring } = await supabase
      .from('movie_scores')
      .select('id, rt_tomatometer, imdb_rating')
      .is('composite_score', null)
      .not('rt_tomatometer', 'is', null)
      .not('imdb_rating', 'is', null);
    
    if (!needsScoring || needsScoring.length === 0) {
      console.log('No movies need composite score calculation');
      process.exit(0);
    }

    console.log(`Fixing ${needsScoring.length} movies...\n`);

    // Calculate scores correctly
    const updates = needsScoring.map((score: any) => {
      const rt = score.rt_tomatometer; // Already 0-100
      const imdb = score.imdb_rating; // This is 0-10, convert to 0-100
      
      // v4 formula: (RT × 0.50) + (IMDb × 0.50)
      // Both should be on 0-100 scale
      const imdbScaled = imdb * 10; // Convert 0-10 to 0-100
      const composite = (rt * 0.5) + (imdbScaled * 0.5);
      
      return {
        id: score.id,
        composite_score: Math.round(composite * 10) / 10
      };
    });

    // Show first few for verification
    console.log('Sample calculations:');
    const { data: sample } = await supabase
      .from('movie_scores')
      .select('id, rt_tomatometer, imdb_rating')
      .in('id', updates.slice(0, 3).map(u => u.id));
    
    sample?.forEach((s: any, idx: number) => {
      const rt = s.rt_tomatometer;
      const imdb = s.imdb_rating;
      const imdbScaled = imdb * 10;
      const composite = (rt * 0.5) + (imdbScaled * 0.5);
      console.log(`  RT ${rt}% + IMDb ${imdb}/10 → scaled ${imdbScaled} → (${rt}×0.5) + (${imdbScaled}×0.5) = ${composite}`);
    });

    // Apply updates in batches
    const batchSize = 50;
    let updated = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('movie_scores')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Batch ${i/batchSize + 1} error:`, error.message);
      } else {
        updated += batch.length;
        console.log(`✓ Updated ${updated}/${updates.length}`);
      }
    }

    console.log(`\n✅ All fixed! Verifying Marty Supreme...`);
    
    const { data: marty } = await supabase
      .from('movies')
      .select('id, title, year')
      .eq('title', 'Marty Supreme')
      .single();

    if (marty) {
      const { data: scores } = await supabase
        .from('movie_scores')
        .select('rt_tomatometer, imdb_rating, composite_score')
        .eq('movie_id', marty.id)
        .single();
      
      console.log(`Marty Supreme (${marty.year}): RT ${scores?.rt_tomatometer}% + IMDb ${scores?.imdb_rating}/10 = ${scores?.composite_score}`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fixCompositeScores();
