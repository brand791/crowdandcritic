import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCorrectly() {
  try {
    // Get all movies that currently have composite_score > 100 (the ones we just broke)
    const { data: needsFix } = await supabase
      .from('movie_scores')
      .select('id, rt_tomatometer, imdb_rating')
      .gt('composite_score', 100);
    
    if (!needsFix || needsFix.length === 0) {
      console.log('No movies need fixing');
      process.exit(0);
    }

    console.log(`Fixing ${needsFix.length} scores...\n`);

    // Both RT and IMDb are 0-100 scale
    // v4 formula: (RT × 0.50) + (IMDb × 0.50)
    const fixes = needsFix.map((s: any) => {
      const rt = s.rt_tomatometer; // 0-100
      const imdb = s.imdb_rating;  // 0-100 (already scaled)
      const correct = (rt * 0.5) + (imdb * 0.5);
      
      return {
        id: s.id,
        composite_score: Math.round(correct * 10) / 10
      };
    });

    // Show first few
    console.log('Sample corrections:');
    const { data: sample } = await supabase
      .from('movie_scores')
      .select('id, rt_tomatometer, imdb_rating, composite_score, movies(title)')
      .in('id', fixes.slice(0, 5).map(f => f.id));
    
    sample?.forEach((s: any, idx: number) => {
      const rt = s.rt_tomatometer;
      const imdb = s.imdb_rating;
      const correct = (rt * 0.5) + (imdb * 0.5);
      const m = Array.isArray(s.movies) ? s.movies[0] : s.movies;
      console.log(`  ${m?.title}: (${rt}×0.5) + (${imdb}×0.5) = ${Math.round(correct * 10) / 10} (was ${s.composite_score})`);
    });

    // Apply updates
    for (let i = 0; i < fixes.length; i += 50) {
      const batch = fixes.slice(i, i + 50);
      const { error } = await supabase
        .from('movie_scores')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log(`✓ Fixed ${Math.min(i + 50, fixes.length)}/${fixes.length}`);
      }
    }

    console.log(`\n✅ All fixed!`);
    
    // Verify Marty Supreme
    const { data: marty } = await supabase
      .from('movies')
      .select('id, title')
      .eq('title', 'Marty Supreme')
      .single();
    
    if (marty) {
      const { data: scores } = await supabase
        .from('movie_scores')
        .select('rt_tomatometer, imdb_rating, composite_score')
        .eq('movie_id', marty.id)
        .single();
      
      console.log(`Verification - Marty Supreme: RT ${scores?.rt_tomatometer}% + IMDb ${scores?.imdb_rating}% = ${scores?.composite_score}`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fixCorrectly();
