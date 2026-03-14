/**
 * utils/scoring.js
 * Contains generic scoring utilities
 */

/**
 * Normalizes a score between a minimum and maximum value (0 to 100)
 */
export function normalizeScore(score, maxPossible = 100) {
  if (score < 0) return 0;
  if (score > maxPossible) return maxPossible;
  return Math.round((score / maxPossible) * 100);
}
