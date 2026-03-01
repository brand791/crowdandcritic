import { computeAllScores } from './lib/scoring';

// The Godfather raw data
const godfather = {
  rt_tomatometer: 97,
  metacritic_score: 100,
  imdb_rating: 9.2,
  rt_audience: 98,
  metacritic_user: 91,
  canon_appearances: 14,
  popularity_score: 4.864, // This is what was in the database
  year: 1972,
};

console.log('Verifying The Godfather scoring...\n');

const result = computeAllScores(godfather as any);

console.log('Calculated Scores:');
console.log('  Critic Score:', result.critic_score);
console.log('  Audience Score:', result.audience_score);
console.log('  Canon Score:', result.canon_score);
console.log('  Longevity Bonus:', result.longevity_bonus);
console.log('  Popularity Score:', result.popularity_score);
console.log('  Composite Score:', result.composite_score);

console.log('\nFormula Breakdown (v3):');
console.log('  Critic (35%):', (result.critic_score * 0.35).toFixed(2));
console.log('  Audience (35%):', (result.audience_score * 0.35).toFixed(2));
console.log('  Canon (15%):', (result.canon_score * 0.15).toFixed(2));
console.log('  Longevity (5%):', ((result.longevity_bonus / 5) * 100 * 0.05).toFixed(2));
console.log('  Popularity (5%):', ((result.popularity_score / 5) * 100 * 0.05).toFixed(2));
console.log('  Total:', result.composite_score.toFixed(2));
