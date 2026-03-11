import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deleteNull() {
  try {
    // Get the IDs of all movie_scores with NULL composite
    const { data: nullScores } = await supabase
      .from('movie_scores')
      .select('id')
      .is('composite_score', null);
    
    if (!nullScores || nullScores.length === 0) {
      console.log('No NULL scores to delete');
      process.exit(0);
    }

    console.log(`Deleting ${nullScores.length} movie_scores entries with NULL composite...\n`);

    const idsToDelete = nullScores.map(s => s.id);

    // Delete in batches
    let deleted = 0;
    for (let i = 0; i < idsToDelete.length; i += 100) {
      const batch = idsToDelete.slice(i, i + 100);
      const { error } = await supabase
        .from('movie_scores')
        .delete()
        .in('id', batch);

      if (error) {
        console.error(`Batch error:`, error.message);
      } else {
        deleted += batch.length;
        console.log(`✓ Deleted ${deleted}/${idsToDelete.length}`);
      }
    }

    console.log(`\n✅ Deleted ${deleted} NULL score entries!`);

    // Verify
    const { data: remaining } = await supabase
      .from('movie_scores')
      .select('id');
    
    console.log(`Total movie_scores remaining: ${remaining?.length}`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

deleteNull();
