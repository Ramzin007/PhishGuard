/**
 * src/background/nlpAnalyzer.js
 * 
 * Utility module for the PhishGuard AI Chrome Extension.
 * Ensures the calculated phishing risk score remains within the valid range (0-100).
 * Designed to be compatible with a Chrome Extension Manifest V3 background service worker.
 */

/**
 * Caps the risk score at a maximum value of 100 and a minimum of 0.
 * 
 * @param {number} score - The raw calculated risk score.
 * @returns {number} The bounded risk score safely between 0 and 100.
 */
export function capRiskScore(score) {
  // If the score is greater than 100, return the maximum allowed value
  if (score > 100) {
    return 100;
  }
  
  // If the score is less than 0, return the minimum allowed value
  if (score < 0) {
    return 0;
  }
  
  // Otherwise, return the score unchanged
  return score;
}
