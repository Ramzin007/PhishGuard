/**
 * background/riskEngine.js
 * Basic risk analysis engine looking for suspicious patterns in URL and page text/DOM.
 */
import { normalizeScore } from '../utils/scoring.js';

export function analyzeRisk(pageData) {
  let riskScore = 0;
  const reasons = [];

  const { url, text, hasLoginForm } = pageData;

  // 1. Analyze URL for suspicious keywords
  const suspiciousUrlKeywords = ['verify', 'secure', 'login-update', 'account', 'billing'];
  let urlFlags = 0;
  const lowerUrl = url.toLowerCase();
  
  suspiciousUrlKeywords.forEach(keyword => {
    if (lowerUrl.includes(keyword)) {
      urlFlags++;
      reasons.push(`Suspicious URL keyword: "${keyword}"`);
    }
  });
  
  riskScore += (urlFlags * 15);

  // 2. Structural Analysis
  if (hasLoginForm) {
    // Having a login form isn't intrinsically evil, but combined with other flags it is risky
    riskScore += 20;
    reasons.push('Login form (password input) detected');
  }

  // 3. Page Content Analysis for Urgent Phishing Phrases
  if (text) {
    const lowerText = text.toLowerCase();
    const urgentPhrases = [
      'verify your account',
      'urgent action required',
      'account suspended',
      'login immediately',
      'update your payment'
    ];

    let textFlags = 0;
    urgentPhrases.forEach(phrase => {
      if (lowerText.includes(phrase)) {
        textFlags++;
        reasons.push(`Urgent phishing language detected: "${phrase}"`);
      }
    });

    riskScore += (textFlags * 25);
  }

  // Calculate final score bounded to 0-100
  const finalScore = normalizeScore(riskScore, 100);

  // Add a generic safe reason if nothing triggered
  if (reasons.length === 0) {
     reasons.push('No obvious phishing indicators found.');
  }

  return {
    riskScore: finalScore,
    reasons: reasons
  };
}
