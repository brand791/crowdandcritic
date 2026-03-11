import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Get all with scores
    const { data: allWithScores } = await supabase
      .from('movie_scores')
      .select('movies(year)')
      .not('composite_score', 'is', null);

    const decades: Record<string, number> = {};
    allWithScores?.forEach(m => {
      const year = (m.movies as any)?.year;
      if (year) {
        const decade = Math.floor(year / 10) * 10;
        decades[decade] = (decades[decade] || 0) + 1;
      }
    });

    console.log(`=== COVERAGE BY DECADE ===\n`);
    Object.keys(decades).sort((a, b) => parseInt(b) - parseInt(a)).forEach(dec => {
      const count = decades[dec];
      const pct = ((count / (allWithScores?.length || 1)) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(count / 10));
      console.log(`${dec}s: ${count.toString().padEnd(3)} (${pct.padEnd(5)}%) ${bar}`);
    });

    console.log(`\nTotal: ${allWithScores?.length} movies`);

    // Show some classics from each era
    console.log(`\n=== SAMPLE CLASSICS BY ERA ===`);
    
    const eras = [
      { decade: 1920, name: '1920s' },
      { decade: 1930, name: '1930s' },
      { decade: 1940, name: '1940s' },
      { decade: 1950, name: '1950s' },
      { decade: 1960, name: '1960s' },
      { decade: 1970, name: '1970s' },
      { decade: 1980, name: '1980s' },
      { decade: 1990, name: '1990s' },
      { decade: 2000, name: '2000s' },
      { decade: 2010, name: '2010s' },
      { decade: 2020, name: '2020s' }
    ];

    for (const era of eras) {
      const { data: sample } = await supabase
        .from('movie_scores')
        .select('composite_score, movies(title, year)')
        .gte('movies.year', era.decade)
        .lt('movies.year', era.decade + 10)
        .not('composite_score', 'is', null)
        .order('composite_score', { ascending: false })
        .limit(2);

      if (sample && sample.length > 0) {
        console.log(`\n${era.name}:`);
        sample.forEach((m: any) => {
          const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
          console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
        });
      }
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
