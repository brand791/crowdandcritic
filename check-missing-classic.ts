import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Search for The Last Temptation of Christ
    const { data: lastTemptation } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', '%Last Temptation%');
    
    console.log(`=== SEARCH: THE LAST TEMPTATION OF CHRIST ===`);
    if (lastTemptation && lastTemptation.length > 0) {
      console.log('✅ FOUND');
      lastTemptation.forEach(m => {
        console.log(`  ${m.title} (${m.year})`);
      });
    } else {
      console.log('❌ NOT IN DATABASE');
    }

    // Search for Black Adam for comparison
    const { data: blackAdam } = await supabase
      .from('movies')
      .select('id, title, year')
      .eq('title', 'Black Adam');
    
    console.log(`\n=== BLACK ADAM ===`);
    if (blackAdam && blackAdam.length > 0) {
      console.log('✅ FOUND');
      blackAdam.forEach(m => console.log(`  ${m.title} (${m.year})`));

      // Get its score
      if (blackAdam[0]) {
        const { data: scores } = await supabase
          .from('movie_scores')
          .select('composite_score')
          .eq('movie_id', blackAdam[0].id)
          .single();
        
        console.log(`  Score: ${scores?.composite_score}`);
      }
    } else {
      console.log('❌ NOT IN DATABASE');
    }

    // Count movies by year to see coverage
    console.log(`\n=== DATABASE COVERAGE BY DECADE ===`);
    const { data: byYear } = await supabase
      .from('movies')
      .select('year')
      .order('year', { ascending: false });
    
    const decades: Record<string, number> = {};
    byYear?.forEach(m => {
      const decade = Math.floor(m.year / 10) * 10;
      decades[decade] = (decades[decade] || 0) + 1;
    });

    Object.keys(decades).sort((a, b) => parseInt(b) - parseInt(a)).forEach(dec => {
      console.log(`  ${dec}s: ${decades[dec]} movies`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
