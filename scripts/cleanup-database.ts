import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanup() {
  try {
    console.log(`=== CLEANING UP DATABASE ===\n`);

    // Remove duplicates - keep the one with poster, or first one
    const idsToDelete = [
      '73ce1a51-1a95-4bb5-8e03-d339e248a56a', // Dark Knight duplicate (no poster)
      'db6b2fb0-dcd8-4358-bc3d-df6dabafacc8', // Fanny and Alexander duplicate (no poster)
      'baa8d6a0-cf48-4316-a8f2-b3936ef1483a'  // Contempt duplicate (no poster)
    ];

    console.log(`Removing ${idsToDelete.length} duplicate movie entries...\n`);

    const { error: deleteError } = await supabase
      .from('movies')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Delete error:', deleteError.message);
    } else {
      console.log(`✅ Deleted ${idsToDelete.length} duplicates`);

      // Also delete their scores
      const { error: scoreError } = await supabase
        .from('movie_scores')
        .delete()
        .in('movie_id', idsToDelete);

      if (!scoreError) {
        console.log(`✅ Deleted ${idsToDelete.length} associated scores`);
      }
    }

    // Verify
    const { data: remaining } = await supabase
      .from('movies')
      .select('id');

    console.log(`\nDatabase now has: ${remaining?.length} movies (was 1000)`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

cleanup();
