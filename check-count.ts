import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
  const { data: scored, error: e1 } = await supabase
    .from('movie_scores')
    .select('*', { count: 'exact', head: true });
  
  const { data: all, error: e2 } = await supabase
    .from('movies')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Movies with scores: ${scored?.length || '?'}`);
  console.log(`Total movies: ${all?.length || '?'}`);
}

checkCount();
