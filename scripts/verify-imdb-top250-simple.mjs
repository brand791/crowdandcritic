import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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
  "Sing", "Sing 2", "Zathura", "Bee Movie", "Monsters vs. Aliens", "Megamind"
];

async function verify() {
  console.log("🔍 Verifying IMDb Top 250 coverage...\n");

  const missing = [];
  const foundWithScore = [];
  const foundNoScore = [];

  for (const title of imdbTop250) {
    const { data } = await supabase
      .from("movies")
      .select("title, movie_scores(composite_score)")
      .ilike("title", `%${title}%`)
      .limit(1);

    if (data?.length > 0) {
      const score = data[0].movie_scores?.composite_score;
      if (score !== null && score !== undefined) {
        foundWithScore.push({ title: data[0].title, score });
      } else {
        foundNoScore.push(data[0].title);
      }
    } else {
      missing.push(title);
    }
  }

  console.log("📊 VERIFICATION RESULTS");
  console.log("========================");
  console.log(`✅ Found with scores: ${foundWithScore.length}/${imdbTop250.length} (${((foundWithScore.length / imdbTop250.length) * 100).toFixed(1)}%)`);
  console.log(`⚠️  Found but NO score: ${foundNoScore.length}/${imdbTop250.length}`);
  console.log(`❌ Missing completely: ${missing.length}/${imdbTop250.length}\n`);

  if (missing.length > 0) {
    console.log(`📋 ${missing.length} MISSING MOVIES:`);
    missing.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  }

  if (foundNoScore.length > 0) {
    console.log(`\n⚠️  ${foundNoScore.length} FOUND BUT NO SCORE:`);
    foundNoScore.slice(0, 20).forEach(t => console.log(`  - ${t}`));
    if (foundNoScore.length > 20) console.log(`  ... and ${foundNoScore.length - 20} more`);
  }
}

verify().catch(console.error);
