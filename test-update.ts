import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  // Get one movie without a director
  const { data: movies } = await supabase
    .from('movies')
    .select('id, title, director')
    .eq('title', '12 Angry Men')
    .single();

  if (!movies) {
    console.log('Movie not found');
    return;
  }

  console.log('Before:', movies);

  // Try to update it
  const { error } = await supabase
    .from('movies')
    .update({ director: 'Sidney Lumet' })
    .eq('id', movies.id);

  if (error) {
    console.error('Update failed:', error);
    return;
  }

  // Verify
  const { data: updated } = await supabase
    .from('movies')
    .select('id, title, director')
    .eq('id', movies.id)
    .single();

  console.log('After:', updated);
}

testUpdate();
