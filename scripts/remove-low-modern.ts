import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function removeLowModern() {
  try {
    // Get all modern films scoring ≤55
    const { data: toRemove } = await supabase
      .from('movie_scores')
      .select('id, composite_score, movies(title, year)')
      .lte('composite_score', 55)
      .gte('movies.year', 2010);
    
    if (!toRemove || toRemove.length === 0) {
      console.log('No low-scoring modern films to remove');
      process.exit(0);
    }

    console.log(`Removing ${toRemove.length} low-quality modern films...\n`);

    toRemove.slice(0, 15).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });
    if (toRemove.length > 15) {
      console.log(`  ... and ${toRemove.length - 15} more`);
    }

    // Delete movie_scores entries
    const idsToDelete = toRemove.map(m => m.id);
    const { error } = await supabase
      .from('movie_scores')
      .delete()
      .in('id', idsToDelete);

    if (error) {
      console.error('Delete error:', error.message);
      process.exit(1);
    }

    console.log(`\n✅ Removed ${toRemove.length} films`);

    // Verify
    const { data: remaining } = await supabase
      .from('movie_scores')
      .select('id');

    console.log(`Remaining: ${remaining?.length} movies`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

removeLowModern();
