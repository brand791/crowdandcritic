import { computeAllScores } from './lib/scoring';

// Test with Godfather's scores
const godfather = {
  rt_tomatometer: 100,
  metacritic_score: 100,
  imdb_rating: 9.2,
  rt_audience: 99,
  metacritic_user: 95,
  canon_appearances: 15,
  year: 1972,
  popularity_score: undefined, // v2 - no popularity
};

const godfatherV3 = {
  ...godfather,
  popularity_score: 4, // v3 - with simulated popularity
};

console.log('V2 Formula (no popularity):');
const v2 = computeAllScores(godfather);
console.log('Composite:', v2.composite_score);
console.log('Critic:', v2.critic_score);
console.log('Audience:', v2.audience_score);
console.log('Canon:', v2.canon_score);
console.log('Longevity:', v2.longevity_bonus);

console.log('\nV3 Formula (with popularity=4):');
const v3 = computeAllScores(godfatherV3);
console.log('Composite:', v3.composite_score);
console.log('Critic:', v3.critic_score);
console.log('Audience:', v3.audience_score);
console.log('Canon:', v3.canon_score);
console.log('Longevity:', v3.longevity_bonus);
console.log('Popularity:', v3.popularity_score);

console.log('\nDebug: Components');
console.log(`Critic 35%: ${v3.critic_score} * 0.35 = ${v3.critic_score * 0.35}`);
console.log(`Audience 35%: ${v3.audience_score} * 0.35 = ${v3.audience_score * 0.35}`);
console.log(`Canon 15%: ${v3.canon_score} * 0.15 = ${v3.canon_score * 0.15}`);
console.log(`Longevity 5%: ${v3.longevity_bonus} * 0.05 = ${v3.longevity_bonus * 0.05}`);
console.log(`Pop normalized (0-100): ${(4/5)*100} * 0.05 = ${((4/5)*100) * 0.05}`);
