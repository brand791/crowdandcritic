/**
 * CrowdAndCritic Composite Scoring Engine
 *
 * v3 Formula: (Critic * 0.35 + Audience * 0.35 + Canon * 0.15 + Popularity * 0.05) + Longevity Bonus (0-5 flat)
 * v2 Formula: (Critic * 0.40 + Audience * 0.40 + Canon * 0.15) + Longevity Bonus (0-5 flat)
 */

export interface RawScores {
  // Critic signals
  rt_tomatometer: number | null;    // 0–100
  metacritic_score: number | null;  // 0–100

  // Audience signals
  imdb_rating: number | null;       // 0–10 (will normalize to 0–100)
  rt_audience: number | null;       // 0–100
  metacritic_user: number | null;   // 0–100

  // Canon
  canon_appearances: number;

  // Popularity (optional, for v3 formula)
  popularity_score?: number;        // 0–5 (Reddit + YouTube)

  // Context
  year: number;
}

export interface ComputedScores {
  critic_score: number;
  audience_score: number;
  canon_score: number;
  longevity_bonus: number;
  popularity_score: number;
  composite_score: number;
}

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
 * Compute longevity bonus as a percentage based on decade released
 * - 2016-present: 0%
 * - 2006-2015: 1%
 * - 1996-2005: 2%
 * - 1986-1995: 3%
 * - 1976-1985: 4%
 * - Pre-1976: 5%
 */
export function computeLongevityBonus(
  year: number,
  currentYear: number = new Date().getFullYear()
): number {
  const age = currentYear - year;
  
  if (age < 10) return 0;        // 2016-present
  if (age < 20) return 1;        // 2006-2015
  if (age < 30) return 2;        // 1996-2005
  if (age < 40) return 3;        // 1986-1995
  if (age < 50) return 4;        // 1976-1985
  return 5;                       // Pre-1976
}

/**
 * Compute all scores from raw inputs
 * 
 * v2 Formula (without popularity):
 *   - Critic: 40%, Audience: 40%, Canon: 15% = 95% (of base score)
 *   - Plus: Longevity Bonus (0-5 points flat)
 * 
 * v3 Formula (with popularity):
 *   - Critic: 35%, Audience: 35%, Canon: 15%, Popularity: 5% = 90% (of base score)
 *   - Plus: Longevity Bonus (0-5 points flat)
 * 
 * Base components normalized to 0-100 scale. Max score: 95-105 depending on longevity.
 */
export function computeAllScores(raw: RawScores): ComputedScores {
  const critic_score = computeCriticScore(raw.rt_tomatometer, raw.metacritic_score);
  const audience_score = computeAudienceScore(raw.imdb_rating, raw.rt_audience, raw.metacritic_user);
  const canon_score = computeCanonScore(raw.canon_appearances);
  const longevity_bonus = computeLongevityBonus(raw.year); // Returns 0-5 (flat bonus, not %)
  const popularity_score = raw.popularity_score ?? 0; // 0-5, default 0 if not provided

  // Normalize popularity to 0-100 scale for weighting
  const popularity_normalized = (popularity_score / 5) * 100;

  // Use v3 formula if popularity is provided, otherwise v2
  let composite_score: number;
  if (raw.popularity_score !== undefined && raw.popularity_score > 0) {
    // v3: with popularity
    // Formula: (Critic*0.35 + Audience*0.35 + Canon*0.15 + Popularity*0.05) + Longevity Bonus
    composite_score =
      critic_score * 0.35 +
      audience_score * 0.35 +
      canon_score * 0.15 +
      popularity_normalized * 0.05 +
      longevity_bonus; // Flat 0-5 point bonus, not weighted
  } else {
    // v2: without popularity
    // Formula: (Critic*0.40 + Audience*0.40 + Canon*0.15) + Longevity Bonus
    composite_score =
      critic_score * 0.40 +
      audience_score * 0.40 +
      canon_score * 0.15 +
      longevity_bonus; // Flat 0-5 point bonus, not weighted
  }

  return {
    critic_score: Math.round(critic_score * 100) / 100,
    audience_score: Math.round(audience_score * 100) / 100,
    canon_score: Math.round(canon_score * 100) / 100,
    longevity_bonus: Math.round(longevity_bonus * 100) / 100,
    popularity_score: Math.round(popularity_score * 100) / 100,
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
