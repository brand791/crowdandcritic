import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    // Check total movies
    const { data: all } = await supabase
      .from('movie_scores')
      .select('id');
    
    console.log(`=== DATABASE STATUS ===\n`);
    console.log(`Total movies: ${all?.length}`);

    // Check coverage by decade
    const { data: byYear } = await supabase
      .from('movies')
      .select('year')
      .order('year', { ascending: false });
    
    const decades: Record<string, number> = {};
    byYear?.forEach(m => {
      const decade = Math.floor(m.year / 10) * 10;
      decades[decade] = (decades[decade] || 0) + 1;
    });

    console.log(`\nCoverage by decade:`);
    Object.keys(decades).sort((a, b) => parseInt(b) - parseInt(a)).slice(0, 10).forEach(dec => {
      console.log(`  ${dec}s: ${decades[dec]}`);
    });

    // Check for new classics
    console.log(`\n=== NEW CLASSICS ADDED ===`);
    const classics = [
      'The Last Temptation of Christ',
      'The Maltese Falcon',
      'Breathless',
      'Nosferatu',
      'Battleship Potemkin',
      'Frankenstein',
      'Breakfast at Tiffany\'s',
      'The Birds',
      'Shadow of a Doubt',
      'Marnie',
      'A Streetcar Named Desire',
      'Dr. Strangelove',
    ];

    for (const title of classics) {
      const { data: movie } = await supabase
        .from('movies')
        .select('id, title, year')
        .ilike('title', `%${title.split(' ')[0]}%`)
        .limit(1)
        .single();

      if (movie) {
        const { data: scores } = await supabase
          .from('movie_scores')
          .select('composite_score')
          .eq('movie_id', movie.id)
          .single();
        
        console.log(`  ${movie.title} (${movie.year}): ${scores?.composite_score}`);
      }
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
