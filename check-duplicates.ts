import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Get all movies
    const { data: all } = await supabase
      .from('movies')
      .select('id, title, year, poster_url');

    if (!all) {
      process.exit(0);
    }

    console.log(`=== DATABASE CLEANUP AUDIT ===\n`);
    console.log(`Total movies: ${all.length}\n`);

    // Check for duplicates
    const titleYearMap: Record<string, any[]> = {};
    all.forEach(m => {
      const key = `${m.title}|${m.year}`;
      if (!titleYearMap[key]) {
        titleYearMap[key] = [];
      }
      titleYearMap[key].push(m);
    });

    const duplicates = Object.entries(titleYearMap).filter(([_, movies]) => movies.length > 1);
    console.log(`DUPLICATES: ${duplicates.length} titles appear multiple times\n`);

    if (duplicates.length > 0) {
      duplicates.slice(0, 15).forEach(([key, movies]) => {
        console.log(`  ${key}:`);
        movies.forEach(m => {
          console.log(`    - ID: ${m.id} (poster: ${m.poster_url ? '✓' : '✗'})`);
        });
      });
      if (duplicates.length > 15) {
        console.log(`  ... and ${duplicates.length - 15} more duplicates`);
      }
    }

    // Check for missing posters
    const noPoster = all.filter(m => !m.poster_url);
    console.log(`\nMISSING POSTERS: ${noPoster.length}/${all.length}\n`);
    noPoster.slice(0, 15).forEach(m => {
      console.log(`  ${m.title} (${m.year})`);
    });
    if (noPoster.length > 15) {
      console.log(`  ... and ${noPoster.length - 15} more`);
    }

    console.log(`\n=== CLEANUP NEEDED ===`);
    console.log(`1. Remove ${duplicates.length} duplicate title/year pairs`);
    console.log(`2. Fetch posters for ${noPoster.length} movies`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
