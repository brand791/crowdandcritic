import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk0NTczMCwiZXhwIjoyMDg3NTIxNzMwfQ.cxu_N9FdX6Xe2GwHmPpiMLn1OY2PFuJ2mOsPSoJy9_o';
const supabase = createClient(supabaseUrl, supabaseKey);
const omdbKey = '17475e67';

async function fetchOmdb() {
  try {
    // Get newly added movies (those without movie_scores)
    const { data: movies } = await supabase
      .from('movies')
      .select('id, title, year, imdb_id')
      .ilike('title', '%Temptation%')
      .limit(15);
    
    if (!movies || movies.length === 0) {
      console.log('No classic movies found');
      process.exit(0);
    }

    console.log(`Fetching OMDB scores for ${movies.length} classic films...\n`);

    const scores: any[] = [];

    for (const movie of movies) {
      const query = `${movie.title} ${movie.year}`;
      const url = `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(movie.title)}&y=${movie.year}&type=movie`;
      
      try {
        const response = await fetch(url);
        const data: any = await response.json();
        
        if (data.Response === 'True') {
          const rt = data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes')?.Value;
          const rtScore = rt ? parseInt(rt) : null;
          const imdbScore = data.imdbRating ? Math.round(parseFloat(data.imdbRating) * 10) : null;
          
          console.log(`${movie.title} (${movie.year}): RT ${rtScore}%, IMDb ${imdbScore}`);
          
          if (rtScore && imdbScore) {
            const composite = (rtScore * 0.5) + (imdbScore * 0.5);
            scores.push({
              movie_id: movie.id,
              rt_tomatometer: rtScore,
              imdb_rating: imdbScore,
              composite_score: Math.round(composite * 10) / 10
            });
          }
        } else {
          console.log(`${movie.title} (${movie.year}): Not found on OMDB`);
        }
      } catch (err) {
        console.log(`${movie.title}: Error fetching - ${err}`);
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if (scores.length > 0) {
      // Insert scores
      const { error } = await supabase
        .from('movie_scores')
        .insert(scores);

      if (error) {
        console.error('Insert error:', error.message);
      } else {
        console.log(`\n✅ Added ${scores.length} scores`);
      }
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

fetchOmdb();
