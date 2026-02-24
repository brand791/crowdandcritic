/**
 * CrowdAndCritic Composite Scoring Engine
 *
 * Composite Score = (critic * 0.30) + (audience * 0.25) + (canon * 0.25) + (longevity * 0.10) + (popularity * 0.10)
 */

export interface RawScores {
  // Critic signals
  rt_tomatometer: number | null;    // 0–100
  metacritic_score: number | null;  // 0–100

  // Audience signals
  imdb_rating: number | null;       // 0–10 (will normalize to 0–100)
  rt_audience: number | null;       // 0–100
  metacritic_user: number | null;   // 0–100

  // Popularity
  imdb_votes: number | null;

  // Canon
  canon_appearances: number;

  // Context
  year: number;
}

export interface ComputedScores {
  critic_score: number;
  audience_score: number;
  canon_score: number;
  longevity_bonus: number;
  popularity_weight: number;
  composite_score: number;
}

// Max IMDb votes we use for normalization (Shawshank ~2.9M, Dark Knight ~2.8M)
const MAX_IMDB_VOTES = 3_000_000;

// Max canon appearances (typically Vertigo/Citizen Kane ~15+ list appearances)
const MAX_CANON_APPEARANCES = 15;

/**
 * Compute the critic score (0–100) from RT + Metacritic
 */
export function computeCriticScore(
  rt_tomatometer: number | null,
  metacritic_score: number | null
): number {
  const scores: number[] = [];
  if (rt_tomatometer != null) scores.push(rt_tomatometer);
  if (metacritic_score != null) scores.push(metacritic_score);
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Compute the audience score (0–100) from IMDb + RT Audience + Metacritic User
 */
export function computeAudienceScore(
  imdb_rating: number | null,
  rt_audience: number | null,
  metacritic_user: number | null
): number {
  const scores: number[] = [];
  if (imdb_rating != null) scores.push(imdb_rating * 10); // normalize 0–10 → 0–100
  if (rt_audience != null) scores.push(rt_audience);
  if (metacritic_user != null) scores.push(metacritic_user);
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Compute canon score (0–100) based on appearances on prestigious lists
 */
export function computeCanonScore(
  canon_appearances: number,
  maxAppearances: number = MAX_CANON_APPEARANCES
): number {
  if (maxAppearances === 0) return 0;
  return Math.min((canon_appearances / maxAppearances) * 100, 100);
}

/**
 * Compute longevity bonus (0–100)
 * Older films still rated highly get a boost.
 * Formula: ((currentYear - releaseYear) / 100) * avg_score, capped at 100
 */
export function computeLongevityBonus(
  year: number,
  avgScore: number,
  currentYear: number = new Date().getFullYear()
): number {
  const ageFactor = Math.min((currentYear - year) / 100, 1.0);
  return Math.min(ageFactor * avgScore, 100);
}

/**
 * Compute popularity weight (0–100) using log scale
 */
export function computePopularityWeight(
  imdb_votes: number | null,
  maxVotes: number = MAX_IMDB_VOTES
): number {
  if (!imdb_votes || imdb_votes <= 0) return 0;
  return Math.min((Math.log10(imdb_votes) / Math.log10(maxVotes)) * 100, 100);
}

/**
 * Compute all scores from raw inputs
 */
export function computeAllScores(raw: RawScores): ComputedScores {
  const critic_score = computeCriticScore(raw.rt_tomatometer, raw.metacritic_score);
  const audience_score = computeAudienceScore(raw.imdb_rating, raw.rt_audience, raw.metacritic_user);
  const canon_score = computeCanonScore(raw.canon_appearances);
  const avg_score = (critic_score + audience_score) / 2;
  const longevity_bonus = computeLongevityBonus(raw.year, avg_score);
  const popularity_weight = computePopularityWeight(raw.imdb_votes);

  const composite_score =
    critic_score * 0.30 +
    audience_score * 0.25 +
    canon_score * 0.25 +
    longevity_bonus * 0.10 +
    popularity_weight * 0.10;

  return {
    critic_score: Math.round(critic_score * 100) / 100,
    audience_score: Math.round(audience_score * 100) / 100,
    canon_score: Math.round(canon_score * 100) / 100,
    longevity_bonus: Math.round(longevity_bonus * 100) / 100,
    popularity_weight: Math.round(popularity_weight * 100) / 100,
    composite_score: Math.round(composite_score * 100) / 100,
  };
}

/**
 * Get a color for a score value (used in UI)
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e'; // green
  if (score >= 70) return '#f5a623'; // gold
  if (score >= 55) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Format a score for display
 */
export function formatScore(score: number | null | undefined): string {
  if (score == null) return 'N/A';
  return score.toFixed(1);
}
