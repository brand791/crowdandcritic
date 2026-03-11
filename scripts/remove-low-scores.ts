import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function removeLow() {
  try {
    // Find all movies with composite < 50
    const { data: lowScores } = await supabase
      .from('movie_scores')
      .select('id, composite_score, movies(title, year)')
      .not('composite_score', 'is', null)
      .lt('composite_score', 50)
      .order('composite_score', { ascending: false });
    
    if (!lowScores || lowScores.length === 0) {
      console.log('No low-scoring movies found');
      process.exit(0);
    }

    console.log(`Removing ${lowScores.length} low-scoring movies from display...\n`);

    // Show what we're removing
    console.log('Movies to remove (setting composite_score to NULL):');
    lowScores.slice(0, 20).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });
    if (lowScores.length > 20) {
      console.log(`  ... and ${lowScores.length - 20} more`);
    }

    // Update: set composite_score to NULL for all low scores
    const updates = lowScores.map(m => ({
      id: m.id,
      composite_score: null
    }));

    // Batch update
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      const { error } = await supabase
        .from('movie_scores')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Batch ${Math.ceil((i+1)/100)} error:`, error.message);
      } else {
        console.log(`✓ Removed ${Math.min(i + 100, updates.length)}/${updates.length}`);
      }
    }

    console.log(`\n✅ Removed ${lowScores.length} low-scoring movies!`);

    // Verify - count remaining
    const { data: remaining } = await supabase
      .from('movie_scores')
      .select('id')
      .not('composite_score', 'is', null)
      .gt('composite_score', 0);
    
    console.log(`Total movies now on list: ${remaining?.length}`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

removeLow();
