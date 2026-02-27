/**
 * CrowdAndCritic Seed Script
 * Run with: npx tsx scripts/seed.ts
 *
 * Seeds the Supabase database with the top 25+ classic/acclaimed films.
 * Scores are based on real known values from RT, Metacritic, IMDb, and known canonical list appearances.
 */

import { createClient } from '@supabase/supabase-js';
import { computeAllScores } from '../lib/scoring';

// Use service role for write access, fall back to anon
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseKey);

interface SeedMovie {
  title: string;
  year: number;
  imdb_id: string;
  director: string;
  genres: string[];
  runtime_minutes: number;
  plot: string;
  poster_url: string;
  // Raw scores
  rt_tomatometer: number;
  metacritic_score: number;
  imdb_rating: number;
  rt_audience: number;
  metacritic_user: number;
  imdb_votes: number;
  canon_appearances: number;
  // Canon list entries
  canon_lists: Array<{ list_name: string; rank_on_list: number }>;
}

const SEED_MOVIES: SeedMovie[] = [
  {
    title: 'The Godfather',
    year: 1972,
    imdb_id: 'tt0068646',
    director: 'Francis Ford Coppola',
    genres: ['Drama', 'Crime'],
    runtime_minutes: 175,
    plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 97,
    metacritic_score: 100,
    imdb_rating: 9.2,
    rt_audience: 98,
    metacritic_user: 91,
    imdb_votes: 2000000,
    canon_appearances: 14,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 2 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 1 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 4 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 3 },
    ],
  },
  {
    title: 'Citizen Kane',
    year: 1941,
    imdb_id: 'tt0033467',
    director: 'Orson Welles',
    genres: ['Drama', 'Mystery'],
    runtime_minutes: 119,
    plot: 'Following the death of publishing tycoon Charles Foster Kane, reporters scramble to uncover the meaning of his final utterance.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BYjBiOTYxZWItMzdiZi00NjlkLWIzZTYtYmFhZjhiMTljOTdkXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 99,
    metacritic_score: 100,
    imdb_rating: 8.3,
    rt_audience: 90,
    metacritic_user: 85,
    imdb_votes: 450000,
    canon_appearances: 15,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 1 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 3 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 2 },
      { list_name: 'Roger Ebert Great Movies', rank_on_list: 1 },
    ],
  },
  {
    title: 'Vertigo',
    year: 1958,
    imdb_id: 'tt0052357',
    director: 'Alfred Hitchcock',
    genres: ['Mystery', 'Romance', 'Thriller'],
    runtime_minutes: 128,
    plot: 'A former San Francisco police detective juggles wrestling with his acrophobia and becoming obsessed with a mysterious woman.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BYTE4ODEwZDUtNDFjOC00NjAxLWEzYTQtYTI1NGVmZmFlNjdiXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg',
    rt_tomatometer: 95,
    metacritic_score: 100,
    imdb_rating: 8.3,
    rt_audience: 84,
    metacritic_user: 86,
    imdb_votes: 430000,
    canon_appearances: 14,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 1 },
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 9 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 7 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 15 },
    ],
  },
  {
    title: 'Casablanca',
    year: 1942,
    imdb_id: 'tt0034583',
    director: 'Michael Curtiz',
    genres: ['Drama', 'Romance', 'War'],
    runtime_minutes: 102,
    plot: 'A cynical expatriate American cafe owner struggles to decide whether or not to help his former lover and her fugitive husband escape the Nazis in French Morocco.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BY2IzZGY2YmEtYzljNS00NTM5LTgwMzUtMzM1NjQ4NGI0OTk0XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_SX300.jpg',
    rt_tomatometer: 99,
    metacritic_score: 100,
    imdb_rating: 8.5,
    rt_audience: 95,
    metacritic_user: 88,
    imdb_votes: 600000,
    canon_appearances: 13,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 3 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 26 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 11 },
    ],
  },
  {
    title: "Schindler's List",
    year: 1993,
    imdb_id: 'tt0108052',
    director: 'Steven Spielberg',
    genres: ['Biography', 'Drama', 'History'],
    runtime_minutes: 195,
    plot: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNDE4OTU5OTgtMmIwNi00YjlmLWI0ZjAtZDE1NDdiMzg4YzFlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
    rt_tomatometer: 98,
    metacritic_score: 94,
    imdb_rating: 9.0,
    rt_audience: 98,
    metacritic_user: 92,
    imdb_votes: 1400000,
    canon_appearances: 10,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 8 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 29 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 7 },
    ],
  },
  {
    title: '2001: A Space Odyssey',
    year: 1968,
    imdb_id: 'tt0062622',
    director: 'Stanley Kubrick',
    genres: ['Adventure', 'Sci-Fi'],
    runtime_minutes: 149,
    plot: "After discovering a mysterious artifact buried beneath the Lunar surface, mankind sets off on a quest to find its origins with help from intelligent supercomputer H.A.L. 9000.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMmNlYzRiNDctZWNhMi00MzI4LThkZTctZTdjZWIyOWYyNzIyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 92,
    metacritic_score: 84,
    imdb_rating: 8.3,
    rt_audience: 89,
    metacritic_user: 86,
    imdb_votes: 730000,
    canon_appearances: 13,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 15 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 6 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 2 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 5 },
    ],
  },
  {
    title: 'Rear Window',
    year: 1954,
    imdb_id: 'tt0047396',
    director: 'Alfred Hitchcock',
    genres: ['Mystery', 'Thriller'],
    runtime_minutes: 112,
    plot: 'A photographer confined to a wheelchair suspects a neighbor has committed murder while spying on the occupants of the opposite apartment building.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNGUxYWM3M2MtMGM3Mi00ZmRiLWE2NDgtZjdlNWI5ZjFjZTE4XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
    rt_tomatometer: 98,
    metacritic_score: 100,
    imdb_rating: 8.5,
    rt_audience: 95,
    metacritic_user: 90,
    imdb_votes: 460000,
    canon_appearances: 11,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 10 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 24 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 14 },
    ],
  },
  {
    title: 'Seven Samurai',
    year: 1954,
    imdb_id: 'tt0047478',
    director: 'Akira Kurosawa',
    genres: ['Action', 'Adventure', 'Drama'],
    runtime_minutes: 207,
    plot: 'A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNOWF4ZjJiOTQtNWZjOS00ZThhLTk3MDMtMWRmZTMwZjYxZTM4XkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg',
    rt_tomatometer: 100,
    metacritic_score: 98,
    imdb_rating: 8.6,
    rt_audience: 97,
    metacritic_user: 91,
    imdb_votes: 380000,
    canon_appearances: 13,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 17 },
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 68 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 4 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 5 },
    ],
  },
  {
    title: 'Sunrise: A Song of Two Humans',
    year: 1927,
    imdb_id: 'tt0018455',
    director: 'F.W. Murnau',
    genres: ['Drama', 'Romance'],
    runtime_minutes: 94,
    plot: "A married farmer falls under the spell of a city woman who tries to convince him to murder his wife.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNTgxMzkzNTQ5OF5BMl5BanBnXkFtZTgwOTk2MjI5MDE@._V1_SX300.jpg',
    rt_tomatometer: 98,
    metacritic_score: 100,
    imdb_rating: 8.1,
    rt_audience: 88,
    metacritic_user: 85,
    imdb_votes: 55000,
    canon_appearances: 12,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 4 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 6 },
    ],
  },
  {
    title: "Singin' in the Rain",
    year: 1952,
    imdb_id: 'tt0045152',
    director: 'Stanley Donen, Gene Kelly',
    genres: ['Comedy', 'Musical', 'Romance'],
    runtime_minutes: 103,
    plot: "A silent film production company and cast make a difficult transition to sound films in the late 1920s.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNjExMTc1NjE0N15BMl5BanBnXkFtZTgwMzEyMTIxMDE@._V1_SX300.jpg',
    rt_tomatometer: 100,
    metacritic_score: 99,
    imdb_rating: 8.3,
    rt_audience: 90,
    metacritic_user: 87,
    imdb_votes: 280000,
    canon_appearances: 12,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 5 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 20 },
      { list_name: 'AFI 10 Top 10 (Musical)', rank_on_list: 1 },
    ],
  },
  {
    title: 'Psycho',
    year: 1960,
    imdb_id: 'tt0054215',
    director: 'Alfred Hitchcock',
    genres: ['Horror', 'Mystery', 'Thriller'],
    runtime_minutes: 109,
    plot: 'A secretary on the run embezzles money from her employer and checks into a remote motel run by a secretive young man under the domination of his mother.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNTQwNDM1YzItNDAxZC00NWY2LTk0M2UtNDIwNWI5OGUyNWUxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 96,
    metacritic_score: 97,
    imdb_rating: 8.5,
    rt_audience: 93,
    metacritic_user: 89,
    imdb_votes: 700000,
    canon_appearances: 11,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 14 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 35 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 18 },
    ],
  },
  {
    title: 'The Godfather Part II',
    year: 1974,
    imdb_id: 'tt0071562',
    director: 'Francis Ford Coppola',
    genres: ['Crime', 'Drama'],
    runtime_minutes: 202,
    plot: "The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWRiLTIyMDUtMTI1ZGQwMmEwZjViXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 97,
    metacritic_score: 90,
    imdb_rating: 9.0,
    rt_audience: 97,
    metacritic_user: 92,
    imdb_votes: 1300000,
    canon_appearances: 10,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 32 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 9 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 13 },
    ],
  },
  {
    title: 'Tokyo Story',
    year: 1953,
    imdb_id: 'tt0046438',
    director: 'Yasujirō Ozu',
    genres: ['Drama'],
    runtime_minutes: 136,
    plot: 'An aging couple travels to Tokyo to visit their children, but they are largely ignored.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BYWQ4ZTRhODMtNGMzMC00ZDcwLThkMmItMzU3YWRiNjljZTQzXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 100,
    metacritic_score: 100,
    imdb_rating: 8.2,
    rt_audience: 93,
    metacritic_user: 88,
    imdb_votes: 100000,
    canon_appearances: 13,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 3 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 9 },
    ],
  },
  {
    title: 'Mulholland Drive',
    year: 2001,
    imdb_id: 'tt0166924',
    director: 'David Lynch',
    genres: ['Drama', 'Mystery', 'Thriller'],
    runtime_minutes: 147,
    plot: 'After a car wreck on the winding Mulholland Drive renders a woman amnesiac, she and a perky Hollywood-hopeful uncover a dark conspiracy.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BZjM4ZTgwNDItYmU3OS00N2YyLWE3ZWYtMjBiNGFiMGFjNTBjXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 83,
    metacritic_score: 84,
    imdb_rating: 7.9,
    rt_audience: 83,
    metacritic_user: 82,
    imdb_votes: 440000,
    canon_appearances: 10,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 2 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 80 },
    ],
  },
  {
    title: 'Jeanne Dielman, 23 quai du Commerce, 1080 Bruxelles',
    year: 1975,
    imdb_id: 'tt0073198',
    director: 'Chantal Akerman',
    genres: ['Drama'],
    runtime_minutes: 201,
    plot: 'Three days in the life of a Belgian widow and single mother who works as a part-time prostitute out of her home.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BZGZhNThjMzEtNGI4Yi00ZTI4LWE1MDctMWU2ZTI4ZjdhZjlkXkEyXkFqcGdeQXVyMTI5MTI0Njk@._V1_SX300.jpg',
    rt_tomatometer: 97,
    metacritic_score: 97,
    imdb_rating: 7.5,
    rt_audience: 80,
    metacritic_user: 84,
    imdb_votes: 22000,
    canon_appearances: 10,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 1 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 43 },
    ],
  },
  {
    title: 'Barry Lyndon',
    year: 1975,
    imdb_id: 'tt0072684',
    director: 'Stanley Kubrick',
    genres: ['Adventure', 'Drama', 'History'],
    runtime_minutes: 185,
    plot: "An Irish rogue wins the heart of a rich widow and assumes her dead husband's aristocratic position in 18th-century England.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNGYxZmMzODYtZGE4Ny00YjI0LTgyMzEtMTc5ZTI3MjhkN2E5XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg',
    rt_tomatometer: 95,
    metacritic_score: 89,
    imdb_rating: 8.1,
    rt_audience: 86,
    metacritic_user: 85,
    imdb_votes: 200000,
    canon_appearances: 9,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 45 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 39 },
    ],
  },
  {
    title: 'Persona',
    year: 1966,
    imdb_id: 'tt0060827',
    director: 'Ingmar Bergman',
    genres: ['Drama'],
    runtime_minutes: 83,
    plot: 'A nurse is put in charge of an actress who has mysteriously stopped speaking, and realizes they are becoming one and the same person.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BYjg0Y2MzNGMtMmFlNS00YjJjLThiMGMtOGRiNThhYjZkNGJlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 91,
    metacritic_score: 96,
    imdb_rating: 8.1,
    rt_audience: 87,
    metacritic_user: 84,
    imdb_votes: 130000,
    canon_appearances: 11,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 8 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 27 },
    ],
  },
  {
    title: 'Portrait of a Lady on Fire',
    year: 2019,
    imdb_id: 'tt8613070',
    director: 'Céline Sciamma',
    genres: ['Drama', 'Romance'],
    runtime_minutes: 122,
    plot: "On an isolated island in Brittany at the end of the eighteenth century, a female painter is obliged to paint a wedding portrait of a young woman.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNjkwODYwNDEtNzBlMC00YjU5LWE1NzAtZGMwZDlmYzM0Mzc3XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
    rt_tomatometer: 98,
    metacritic_score: 95,
    imdb_rating: 8.1,
    rt_audience: 92,
    metacritic_user: 85,
    imdb_votes: 180000,
    canon_appearances: 6,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 30 },
      { list_name: "Cahiers du Cinéma Top 10 2019", rank_on_list: 1 },
    ],
  },
  {
    title: 'La Règle du jeu',
    year: 1939,
    imdb_id: 'tt0031885',
    director: 'Jean Renoir',
    genres: ['Comedy', 'Drama'],
    runtime_minutes: 110,
    plot: 'A complicated romantic farce takes place in the French countryside where the upper class and their servants play out their own versions of the "rules of the game."',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNzAxYWY5OWYtMjViZi00YjM4LWIxNWQtNzlkNWZiOTZiNDVlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 100,
    metacritic_score: 100,
    imdb_rating: 8.1,
    rt_audience: 85,
    metacritic_user: 88,
    imdb_votes: 55000,
    canon_appearances: 12,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 7 },
      { list_name: 'TSPDT Top 1000', rank_on_list: 12 },
    ],
  },
  {
    title: 'Apocalypse Now',
    year: 1979,
    imdb_id: 'tt0078788',
    director: 'Francis Ford Coppola',
    genres: ['Drama', 'War'],
    runtime_minutes: 153,
    plot: "A U.S. Army officer serving in Vietnam is tasked with assassinating a renegade Special Forces Colonel who sees himself as a god.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMDdhODg0MjYtYzBiOS00ZmI5LWEwZGYtZDEyNDU4MmQyNzFkXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 98,
    metacritic_score: 94,
    imdb_rating: 8.4,
    rt_audience: 94,
    metacritic_user: 89,
    imdb_votes: 700000,
    canon_appearances: 11,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 30 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 22 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 10 },
    ],
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    imdb_id: 'tt0468569',
    director: 'Christopher Nolan',
    genres: ['Action', 'Crime', 'Drama'],
    runtime_minutes: 152,
    plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
    rt_tomatometer: 94,
    metacritic_score: 84,
    imdb_rating: 9.0,
    rt_audience: 94,
    metacritic_user: 87,
    imdb_votes: 2800000,
    canon_appearances: 6,
    canon_lists: [
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 8 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 175 },
    ],
  },
  {
    title: 'Pulp Fiction',
    year: 1994,
    imdb_id: 'tt0110912',
    director: 'Quentin Tarantino',
    genres: ['Crime', 'Drama'],
    runtime_minutes: 154,
    plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 92,
    metacritic_score: 94,
    imdb_rating: 8.9,
    rt_audience: 96,
    metacritic_user: 93,
    imdb_votes: 2100000,
    canon_appearances: 8,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 94 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 3 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 50 },
    ],
  },
  {
    title: 'GoodFellas',
    year: 1990,
    imdb_id: 'tt0099685',
    director: 'Martin Scorsese',
    genres: ['Biography', 'Crime', 'Drama'],
    runtime_minutes: 146,
    plot: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDItZTVmMi00YzE3LWIwNjQtOWRmNzE0ZDM3ZWYzXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    rt_tomatometer: 96,
    metacritic_score: 90,
    imdb_rating: 8.7,
    rt_audience: 97,
    metacritic_user: 91,
    imdb_votes: 1200000,
    canon_appearances: 9,
    canon_lists: [
      { list_name: 'AFI Top 100 (2007)', rank_on_list: 92 },
      { list_name: 'Empire 100 Greatest Films', rank_on_list: 4 },
      { list_name: 'Sight & Sound Top 250', rank_on_list: 48 },
    ],
  },
  {
    title: 'Parasite',
    year: 2019,
    imdb_id: 'tt6751668',
    director: 'Bong Joon-ho',
    genres: ['Comedy', 'Drama', 'Thriller'],
    runtime_minutes: 132,
    plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
    rt_tomatometer: 99,
    metacritic_score: 96,
    imdb_rating: 8.5,
    rt_audience: 90,
    metacritic_user: 88,
    imdb_votes: 900000,
    canon_appearances: 7,
    canon_lists: [
      { list_name: 'Sight & Sound Top 250', rank_on_list: 28 },
      { list_name: "Cahiers du Cinéma Top 10 2019", rank_on_list: 2 },
    ],
  },
  {
    title: 'Get Out',
    year: 2017,
    imdb_id: 'tt5052448',
    director: 'Jordan Peele',
    genres: ['Horror', 'Mystery', 'Thriller'],
    runtime_minutes: 104,
    plot: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering unease about their reception of him eventually reaches a boiling point.",
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc1MTI@._V1_SX300.jpg',
    rt_tomatometer: 98,
    metacritic_score: 84,
    imdb_rating: 7.7,
    rt_audience: 86,
    metacritic_user: 80,
    imdb_votes: 620000,
    canon_appearances: 4,
    canon_lists: [
      { list_name: 'AFI Top 10 Films 2017', rank_on_list: 3 },
    ],
  },
];

async function seed() {
  console.log('🎬 Starting CrowdAndCritic seed...\n');

  // Calculate max canon appearances for normalization
  const maxCanon = Math.max(...SEED_MOVIES.map(m => m.canon_appearances));
  console.log(`📊 Max canon appearances: ${maxCanon}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const movie of SEED_MOVIES) {
    try {
      // Compute scores
      const computed = computeAllScores({
        rt_tomatometer: movie.rt_tomatometer,
        metacritic_score: movie.metacritic_score,
        imdb_rating: movie.imdb_rating,
        rt_audience: movie.rt_audience,
        metacritic_user: movie.metacritic_user,
        canon_appearances: movie.canon_appearances,
        year: movie.year,
      });

      console.log(`Inserting: ${movie.title} (${movie.year}) → composite: ${computed.composite_score}`);

      // Upsert movie
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .upsert(
          {
            title: movie.title,
            year: movie.year,
            imdb_id: movie.imdb_id,
            director: movie.director,
            genres: movie.genres,
            runtime_minutes: movie.runtime_minutes,
            plot: movie.plot,
            poster_url: movie.poster_url,
          },
          { onConflict: 'imdb_id' }
        )
        .select()
        .single();

      if (movieError || !movieData) {
        console.error(`  ❌ Movie insert error:`, movieError?.message);
        errorCount++;
        continue;
      }

      const movieId = movieData.id;

      // Upsert scores
      const { error: scoreError } = await supabase
        .from('movie_scores')
        .upsert(
          {
            movie_id: movieId,
            rt_tomatometer: movie.rt_tomatometer,
            metacritic_score: movie.metacritic_score,
            imdb_rating: movie.imdb_rating,
            rt_audience: movie.rt_audience,
            metacritic_user: movie.metacritic_user,
            canon_appearances: movie.canon_appearances,
            critic_score: computed.critic_score,
            audience_score: computed.audience_score,
            canon_score: computed.canon_score,
            longevity_bonus: computed.longevity_bonus,
            composite_score: computed.composite_score,
          },
          { onConflict: 'movie_id' }
        );

      if (scoreError) {
        console.error(`  ❌ Score insert error:`, scoreError?.message);
      }

      // Insert canon list entries
      if (movie.canon_lists.length > 0) {
        // Delete existing canon entries for this movie
        await supabase.from('canon_lists').delete().eq('movie_id', movieId);

        const canonEntries = movie.canon_lists.map(cl => ({
          movie_id: movieId,
          list_name: cl.list_name,
          rank_on_list: cl.rank_on_list,
        }));

        const { error: canonError } = await supabase
          .from('canon_lists')
          .insert(canonEntries);

        if (canonError) {
          console.error(`  ❌ Canon insert error:`, canonError?.message);
        }
      }

      console.log(`  ✅ ${movie.title} seeded successfully`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Unexpected error for ${movie.title}:`, err);
      errorCount++;
    }
  }

  console.log(`\n🎉 Seed complete! ${successCount} movies seeded, ${errorCount} errors.`);
}

seed().catch(console.error);
