import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rlnkmresgszqiyaamcfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y'
);

async function checkSchema() {
  const { data, error } = await supabase.from('movies').select('*').limit(1);
  if (data && data[0]) {
    console.log('Columns:', Object.keys(data[0]).sort());
    console.log('\nFirst movie data:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('Error:', error);
  }
}

checkSchema().catch(err => console.error(err));
