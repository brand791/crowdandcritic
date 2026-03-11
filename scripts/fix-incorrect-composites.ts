import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixIncorrect() {
  try {
    // Get all movies that we just updated (recently updated, with composite > 100 which shouldn't exist)
    const { data: incorrect } = await supabase
      .from('movie_scores')
      .select('id, rt_tomatometer, imdb_rating, composite_score')
      .gt('composite_score', 100) // Anything over 100 is wrong (max should be 100)
      .order('composite_score', { ascending: false });
    
    console.log(`Found ${incorrect?.length || 0} incorrect scores (over 100)\n`);

    if (incorrect && incorrect.length > 0) {
      const fixes = incorrect.map((s: any) => {
        const rt = s.rt_tomatometer;
        const imdb = s.imdb_rating;
        const imdbScaled = imdb * 10;
        const correct = (rt * 0.5) + (imdbScaled * 0.5);
        
        console.log(`Fixing: RT ${rt}% + IMDb ${imdb}/10 → was ${s.composite_score}, should be ${Math.round(correct * 10) / 10}`);
        
        return {
          id: s.id,
          composite_score: Math.round(correct * 10) / 10
        };
      });

      // Update in batches
      for (let i = 0; i < fixes.length; i += 50) {
        const batch = fixes.slice(i, i + 50);
        await supabase.from('movie_scores').upsert(batch, { onConflict: 'id' });
      }

      console.log(`\n✅ Fixed ${fixes.length} incorrect scores`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fixIncorrect();
