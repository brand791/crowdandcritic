import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCompositeScores() {
  try {
    // Get all movies with RT + IMDb but NULL composite
    const { data: needsScoring } = await supabase
      .from('movie_scores')
      .select(`
        id,
        rt_tomatometer,
        imdb_rating,
        movies(title, year)
      `)
      .is('composite_score', null)
      .not('rt_tomatometer', 'is', null)
      .not('imdb_rating', 'is', null);
    
    if (!needsScoring || needsScoring.length === 0) {
      console.log('No movies need composite score calculation');
      process.exit(0);
    }

    console.log(`Fixing ${needsScoring.length} movies...\n`);

    const updates: any[] = [];
    
    needsScoring.forEach((score: any) => {
      const m = Array.isArray(score.movies) ? score.movies[0] : score.movies;
      const rt = score.rt_tomatometer; // 0-100 scale
      const imdb = score.imdb_rating * 10; // Convert 0-10 to 0-100 scale
      
      // v4 formula: (RT × 0.50) + (IMDb × 0.50)
      const composite = (rt * 0.5) + (imdb * 0.5);
      
      updates.push({
        id: score.id,
        composite_score: Math.round(composite * 10) / 10, // Round to 1 decimal
        title: m.title,
        year: m.year,
        rt,
        imdb: score.imdb_rating
      });
    });

    // Apply updates in batches
    const batchSize = 50;
    let updated = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('movie_scores')
        .upsert(batch.map(u => ({
          id: u.id,
          composite_score: u.composite_score
        })), { onConflict: 'id' });

      if (error) {
        console.error(`Batch ${i/batchSize + 1} error:`, error.message);
      } else {
        updated += batch.length;
        console.log(`✓ Updated ${updated}/${updates.length}`);
        
        // Show first few
        if (i === 0) {
          batch.slice(0, 5).forEach(u => {
            console.log(`  ${u.title} (${u.year}): RT ${u.rt}% + IMDb ${u.imdb}/10 = ${u.composite_score}`);
          });
          if (batch.length > 5) {
            console.log(`  ... and ${batch.length - 5} more`);
          }
        }
      }
    }

    console.log(`\n✅ Fixed ${updated} movies!`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fixCompositeScores();
