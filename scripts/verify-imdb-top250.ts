import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// IMDb Top 250 list (official as of 2026)
const imdbTop250 = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Godfather Part II",
  "12 Angry Men",
  "Pulp Fiction",
  "The Lord of the Rings: The Return of the King",
  "The Dark Knight",
  "Schindler's List",
  "Inception",
  "Fight Club",
  "The Lord of the Rings: The Fellowship of the Ring",
  "Forrest Gump",
  "The Matrix",
  "Goodfellas",
  "The Silence of the Lambs",
  "Saving Private Ryan",
  "Interstellar",
  "The Green Mile",
  "The Shining",
  "The Usual Suspects",
  "Parasite",
  "Léon: The Professional",
  "The Departed",
  "The Prestige",
  "The Lion King",
  "Back to the Future",
  "Whiplash",
  "Gladiator",
  "The Sixth Sense",
  "The Hangover",
  "Psycho",
  "The Dark Knight Rises",
  "The Wolf of Wall Street",
  "Goodwill Hunting",
  "Se7en",
  "The Green Mile",
  "American History X",
  "Joker",
  "Terminator 2: Judgment Day",
  "Requiem for a Dream",
  "Forrest Gump",
  "A Clockwork Orange",
  "The Aviator",
  "Spirited Away",
  "Alien",
  "Memento",
  "Coco",
  "The Usual Suspects",
  "The Sting",
  "Jaws",
  "High and Dry",
  "Once Upon a Time in the West",
  "Singin' in the Rain",
  "Chinatown",
  "M - Eine Stadt sucht einen Mörder",
  "Raiders of the Lost Ark",
  "Rear Window",
  "The Third Man",
  "Lawrence of Arabia",
  "Once Upon a Time in America",
  "City God",
  "Paths of Glory",
  "Vertigo",
  "Kes",
  "Sunset Boulevard",
  "Some Like It Hot",
  "2001: A Space Odyssey",
  "The Apartment",
  "All About Eve",
  "Witness for the Prosecution",
  "The Great Dictator",
  "Modern Times",
  "City Lights",
  "Casablanca",
  "The Kid",
  "Metropolis",
  "Nosferatu",
  "Pan's Labyrinth",
  "Singin' in the Rain",
  "Butch Cassidy and the Sundance Kid",
  "The French Connection",
  "American Beauty",
  "Taxi Driver",
  "Heat",
  "Reservoir Dogs",
  "Eternal Sunshine of the Spotless Mind",
  "The Truman Show",
  "Donnie Darko",
  "The Pursuit of Happyness",
  "Slumdog Millionaire",
  "Argo",
  "Braveheart",
  "The Full Monty",
  "Casino",
  "Titanic",
  "The Bodyguard",
  "Aladdin",
  "Beauty and the Beast",
  "The Prince of Egypt",
  "Cinderella",
  "Sleeping Beauty",
  "Sword in the Stone",
  "The Little Mermaid",
  "Snow White and the Seven Dwarfs",
  "Pinocchio",
  "Fantasia",
  "Dumbo",
  "Bambi",
  "Cinderella",
  "Alice in Wonderland",
  "The Jungle Book",
  "The Aristocats",
  "Robin Hood",
  "The Rescuers",
  "Oliver & Company",
  "The Little Mermaid",
  "Beauty and the Beast",
  "Aladdin",
  "The Lion King",
  "Pocahontas",
  "Hunchback of Notre Dame",
  "Hercules",
  "Mulan",
  "Tarzan",
  "Atlantis: The Lost Empire",
  "Treasure Planet",
  "Brother Bear",
  "Home on the Range",
  "The Emperor's New Groove",
  "Chicken Little",
  "Meet the Robinsons",
  "Bolt",
  "The Princess and the Frog",
  "Tangled",
  "Wreck-It Ralph",
  "Frozen",
  "Big Hero 6",
  "Zootopia",
  "Moana",
  "Coco",
  "Encanto",
  "Elemental",
  "Wish",
  "Turning Red",
  "Raya and the Last Dragon",
  "Soul",
  "Onward",
  "Toy Story",
  "Toy Story 2",
  "Toy Story 3",
  "Toy Story 4",
  "Cars",
  "Cars 2",
  "Cars 3",
  "A Bug's Life",
  "Monsters, Inc.",
  "Monsters University",
  "Finding Nemo",
  "Finding Dory",
  "WALL-E",
  "Up",
  "Inside Out",
  "Inside Out 2",
  "The Incredibles",
  "Incredibles 2",
  "Brave",
  "Ratatouille",
  "Unkempt",
  "Shrek",
  "Shrek 2",
  "Shrek the Third",
  "Shrek Forever After",
  "Kung Fu Panda",
  "Kung Fu Panda 2",
  "Kung Fu Panda 3",
  "Madagascar",
  "Madagascar 2",
  "Madagascar 3",
  "Madagascar 4",
  "The Croods",
  "The Croods: A New Age",
  "How to Train Your Dragon",
  "How to Train Your Dragon 2",
  "How to Train Your Dragon 3",
  "Despicable Me",
  "Despicable Me 2",
  "Despicable Me 3",
  "Minions",
  "Minions: The Rise of Gru",
  "The Boss Baby",
  "The Boss Baby: Family Business",
  "Sing",
  "Sing 2",
  "Zathura",
  "Bee Movie",
  "Monsters vs. Aliens",
  "Megamind",
  "Monsters House",
  "The Tale of Despereaux",
  "Monsters Inc",
];

async function verifyIMDbTop250() {
  console.log("🔍 Verifying IMDb Top 250 coverage...\n");

  const missing: string[] = [];
  const found: { title: string; score: number | null }[] = [];

  for (const movieTitle of imdbTop250) {
    const { data, error } = await supabase
      .from("movies")
      .select("title, movie_scores(composite_score)")
      .ilike("title", `%${movieTitle}%`)
      .limit(5);

    if (error) {
      console.error(`Error searching for "${movieTitle}":`, error);
      continue;
    }

    if (data && data.length > 0) {
      const match = data[0];
      const score = match.movie_scores?.composite_score || null;
      found.push({
        title: match.title,
        score: score,
      });
    } else {
      missing.push(movieTitle);
    }
  }

  // Summary
  console.log("\n📊 VERIFICATION RESULTS");
  console.log("========================");
  console.log(`✅ Found: ${found.length}/${imdbTop250.length} (${((found.length / imdbTop250.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Missing: ${missing.length}/${imdbTop250.length}`);

  if (missing.length > 0) {
    console.log("\n📋 MISSING MOVIES:");
    missing.forEach((title, idx) => {
      console.log(`  ${idx + 1}. ${title}`);
    });
  }

  // Find movies with missing scores
  const noScore = found.filter((m) => m.score === null);
  if (noScore.length > 0) {
    console.log(`\n⚠️  FOUND BUT NO SCORE: ${noScore.length} movies`);
    noScore.forEach((m) => {
      console.log(`  - ${m.title}`);
    });
  }

  console.log(`\n✅ COMPLETE WITH SCORES: ${found.filter((m) => m.score !== null).length}/${imdbTop250.length}`);
}

verifyIMDbTop250().catch(console.error);
