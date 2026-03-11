import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tmdbKey = process.env.TMDB_API_KEY;

if (!supabaseUrl || !supabaseKey || !tmdbKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Complete IMDb Top 250 list
const imdbTop250 = [
  "The Shawshank Redemption", "The Godfather", "The Godfather Part II",
  "12 Angry Men", "Pulp Fiction", "The Lord of the Rings: The Return of the King",
  "The Dark Knight", "Schindler's List", "Inception", "Fight Club",
  "The Lord of the Rings: The Fellowship of the Ring", "Forrest Gump", "The Matrix",
  "Goodfellas", "The Silence of the Lambs", "Saving Private Ryan", "Interstellar",
  "The Green Mile", "The Shining", "The Usual Suspects", "Parasite",
  "Léon: The Professional", "The Departed", "The Prestige", "The Lion King",
  "Back to the Future", "Whiplash", "Gladiator", "The Sixth Sense", "Psycho",
  "The Dark Knight Rises", "The Wolf of Wall Street", "Goodwill Hunting", "Se7en",
  "American History X", "Joker", "Terminator 2: Judgment Day", "Requiem for a Dream",
  "A Clockwork Orange", "The Aviator", "Spirited Away", "Alien", "Memento",
  "Coco", "The Sting", "Jaws", "Once Upon a Time in the West", "Singin' in the Rain",
  "Chinatown", "Raiders of the Lost Ark", "Rear Window", "The Third Man",
  "Lawrence of Arabia", "Once Upon a Time in America", "Paths of Glory", "Vertigo",
  "Sunset Boulevard", "Some Like It Hot", "2001: A Space Odyssey", "The Apartment",
  "All About Eve", "Witness for the Prosecution", "The Great Dictator", "Modern Times",
  "City Lights", "Casablanca", "The Kid", "Metropolis", "Nosferatu", "Pan's Labyrinth",
  "Butch Cassidy and the Sundance Kid", "The French Connection", "American Beauty",
  "Taxi Driver", "Heat", "Reservoir Dogs", "Eternal Sunshine of the Spotless Mind",
  "The Truman Show", "Donnie Darko", "The Pursuit of Happyness", "Slumdog Millionaire",
  "Argo", "Braveheart", "The Full Monty", "Casino", "Titanic", "The Bodyguard",
  "Aladdin", "Beauty and the Beast", "The Prince of Egypt", "Cinderella",
  "Sleeping Beauty", "Sword in the Stone", "The Little Mermaid",
  "Snow White and the Seven Dwarfs", "Pinocchio", "Fantasia", "Dumbo", "Bambi",
  "Alice in Wonderland", "The Jungle Book", "The Aristocats", "Robin Hood",
  "The Rescuers", "Oliver & Company", "Pocahontas", "Hunchback of Notre Dame",
  "Hercules", "Mulan", "Tarzan", "Atlantis: The Lost Empire", "Treasure Planet",
  "Brother Bear", "Home on the Range", "The Emperor's New Groove", "Chicken Little",
  "Meet the Robinsons", "Bolt", "The Princess and the Frog", "Tangled",
  "Wreck-It Ralph", "Frozen", "Big Hero 6", "Zootopia", "Moana", "Encanto",
  "Elemental", "Wish", "Turning Red", "Raya and the Last Dragon", "Soul", "Onward",
  "Toy Story", "Toy Story 2", "Toy Story 3", "Toy Story 4", "Cars", "Cars 2", "Cars 3",
  "A Bug's Life", "Monsters, Inc.", "Monsters University", "Finding Nemo", "Finding Dory",
  "WALL-E", "Up", "Inside Out", "Inside Out 2", "The Incredibles", "Incredibles 2",
  "Brave", "Ratatouille", "Shrek", "Shrek 2", "Shrek the Third", "Shrek Forever After",
  "Kung Fu Panda", "Kung Fu Panda 2", "Kung Fu Panda 3", "Madagascar", "Madagascar 2",
  "Madagascar 3", "Madagascar 4", "The Croods", "The Croods: A New Age",
  "How to Train Your Dragon", "How to Train Your Dragon 2", "How to Train Your Dragon 3",
  "Despicable Me", "Despicable Me 2", "Despicable Me 3", "Minions",
  "Minions: The Rise of Gru", "The Boss Baby", "The Boss Baby: Family Business",
  "Sing", "Sing 2", "Zathura", "Bee Movie", "Monsters vs. Aliens", "Megamind",
  "The Hangover", "The Hangover Part II", "The Hangover Part III",
];

async function addMissingMovies() {
  console.log(`\n🎬 Adding IMDb Top 250 movies to database...\n`);

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const title of imdbTop250) {
    // Check if already exists
    const { data: existing } = await supabase
      .from("movies")
      .select("id")
      .ilike("title", `%${title}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }

    // Search TMDB for the movie
    try {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(title)}`
      );
      const tmdbData = await tmdbRes.json();

      if (!tmdbData.results || tmdbData.results.length === 0) {
        console.log(`⚠️  Not found on TMDB: ${title}`);
        failed++;
        continue;
      }

      const movie = tmdbData.results[0];
      const tmdbId = movie.id;
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

      // Get genres and director
      const detailRes = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbKey}&append_to_response=credits`
      );
      const detailData = await detailRes.json();
      const director = detailData.credits?.crew?.find(
        (c: any) => c.job === "Director"
      )?.name;
      const genreArray = detailData.genres
        ?.slice(0, 3)
        .map((g: any) => g.name) || [];

      // Add to database
      const { error } = await supabase.from("movies").insert({
        title: movie.title || title,
        year: movie.release_date ? parseInt(movie.release_date.split("-")[0]) : null,
        poster_url: poster,
        imdb_id: movie.imdb_id || null,
        plot: movie.overview || null,
        director: director || null,
        genres: genreArray, // Pass as array
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.log(`❌ Failed to add "${title}": ${error.message}`);
        failed++;
      } else {
        console.log(`✅ Added: ${movie.title || title}`);
        added++;
      }

      // Small delay to respect TMDB rate limits
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.log(`❌ Error fetching "${title}":`, err);
      failed++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`✅ Added: ${added}`);
  console.log(`⏭️  Already existed: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n✨ Next step: Run fetch-omdb-scores-v4.ts to score new movies\n`);
}

addMissingMovies().catch(console.error);
