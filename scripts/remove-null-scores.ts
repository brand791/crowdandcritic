import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function removeNull() {
  try {
    // Find all movies with composite_score = NULL
    const { data: nullScores } = await supabase
      .from('movie_scores')
      .select('id, movies(title, year)')
      .is('composite_score', null);
    
    if (!nullScores || nullScores.length === 0) {
      console.log('No NULL scores found');
      process.exit(0);
    }

    console.log(`Found ${nullScores.length} movies with NULL composite_score\n`);

    // Show first 20
    console.log('Movies to remove:');
    nullScores.slice(0, 20).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year})`);
    });
    if (nullScores.length > 20) {
      console.log(`  ... and ${nullScores.length - 20} more`);
    }

    // Delete these movies entirely (since they have no scores)
    const movieIdsToDelete = nullScores.map(m => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      return (mov as any)?.id;
    }).filter(id => id);

    console.log(`\nDeleting ${movieIdsToDelete.length} movies from database...`);

    // Delete in batches
    for (let i = 0; i < movieIdsToDelete.length; i += 100) {
      const batch = movieIdsToDelete.slice(i, i + 100);
      const { error } = await supabase
        .from('movies')
        .delete()
        .in('id', batch);

      if (error) {
        console.error(`Batch error:`, error.message);
      } else {
        console.log(`✓ Deleted ${Math.min(i + 100, movieIdsToDelete.length)}/${movieIdsToDelete.length}`);
      }
    }

    console.log(`\n✅ Removed ${nullScores.length} movies with NULL scores!`);

    // Verify
    const { data: remaining } = await supabase
      .from('movie_scores')
      .select('id')
      .not('composite_score', 'is', null);
    
    console.log(`Total movies remaining: ${remaining?.length}`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

removeNull();
