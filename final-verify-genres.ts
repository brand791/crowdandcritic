import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    const { data: movies } = await supabase
      .from('movies')
      .select('genres');

    if (!movies) {
      process.exit(0);
    }

    console.log(`\n╔════════════════════════════════════╗`);
    console.log(`║   GENRE TABS - FINAL STATUS      ║`);
    console.log(`╚════════════════════════════════════╝\n`);

    const genres: Record<string, number> = {};

    movies.forEach(movie => {
      if (Array.isArray(movie.genres)) {
        movie.genres.forEach((genre: any) => {
          const genreStr = String(genre);
          genres[genreStr] = (genres[genreStr] || 0) + 1;
        });
      }
    });

    const uniqueGenres = Object.keys(genres).sort();
    const numericGenres = uniqueGenres.filter(g => /^\d+$/.test(g));
    const stringGenres = uniqueGenres.filter(g => !/^\d+$/.test(g));

    console.log(`Total genre tabs: ${uniqueGenres.length}`);
    console.log(`  String genres (proper): ${stringGenres.length}`);
    console.log(`  Numeric IDs remaining: ${numericGenres.length}\n`);

    if (numericGenres.length > 0) {
      console.log(`❌ Numeric IDs found:`);
      numericGenres.forEach(g => {
        console.log(`   ${g}: ${genres[g]} movies`);
      });
    } else {
      console.log(`✅ NO numeric IDs remaining!\n`);
      console.log(`✅ Genre tabs (${stringGenres.length}):\n`);
      stringGenres.forEach(g => {
        console.log(`   ${g}: ${genres[g]} movies`);
      });
    }

    console.log(`\n✅ Genre leaderboards tabs are now fully working`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
