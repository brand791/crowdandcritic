import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDirectors() {
  console.log('🎬 Checking director data...\n');

  // Get all movies
  const { data: all, error: allError } = await supabase
    .from('movies')
    .select('id, title, year, director')
    .order('title');

  if (allError) {
    console.error('Error:', allError);
    return;
  }

  const movies: any[] = all || [];
  
  const withDirector = movies.filter(m => m.director !== null && m.director !== '');
  const withoutDirector = movies.filter(m => !m.director || m.director === '');

  console.log(`Total movies: ${movies.length}`);
  console.log(`With director: ${withDirector.length} (${((withDirector.length / movies.length) * 100).toFixed(1)}%)`);
  console.log(`Missing director: ${withoutDirector.length} (${((withoutDirector.length / movies.length) * 100).toFixed(1)}%)\n`);

  if (withDirector.length > 0) {
    console.log('Sample of movies WITH director:');
    withDirector.slice(0, 5).forEach((m: any) => {
      console.log(`  - ${m.title} (${m.year}): ${m.director}`);
    });
  }

  if (withoutDirector.length > 0 && withoutDirector.length <= 20) {
    console.log('\nMovies MISSING director:');
    withoutDirector.forEach((m: any) => {
      console.log(`  - ${m.title} (${m.year})`);
    });
  } else if (withoutDirector.length > 20) {
    console.log('\nSample of movies MISSING director:');
    withoutDirector.slice(0, 20).forEach((m: any) => {
      console.log(`  - ${m.title} (${m.year})`);
    });
    console.log(`  ... and ${withoutDirector.length - 20} more`);
  }
}

checkDirectors();
