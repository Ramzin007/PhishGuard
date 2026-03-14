/**
 * src/content/domExtractor.js
 * 
 * DOM Extraction utility for the PhishGuard AI Chrome Extension.
 * Scans the webpage DOM to detect potentially malicious login forms.
 */

function detectLoginForm() {
  // 1. Check for standard password input fields
  // This is the strongest indicator of a login or registration form
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  if (passwordInputs.length > 0) {
    return true; // Password field found, likely a login form
  }

  // 2. Check for text/email inputs with suspicious names or placeholders
  // Phishing sites sometimes disguise password forms as regular text inputs to bypass simple checks
  const keywords = ['password', 'pass', 'login', 'username', 'email'];
  const suspiciousInputSelector = keywords.map(keyword => 
    `input[name*="${keyword}" i], input[placeholder*="${keyword}" i]`
  ).join(', ');

  const suspiciousInputs = document.querySelectorAll(suspiciousInputSelector);
  
  if (suspiciousInputs.length > 0) {
    // We found fields asking for sensitive info like "username" or "pass"
    return true;
  }

  // 3. Fallback: Check if any form contains both a text/email input AND looks like it's collecting data
  // Even if they don't use standard names, a form with multiple inputs is a risk factor on a suspicious domain
  const forms = document.querySelectorAll('form');
  for (let i = 0; i < forms.length; i++) {
    const textInputs = forms[i].querySelectorAll('input[type="text"], input[type="email"]');
    
    // If a form is asking for 2+ distinct pieces of text information, it might be credential harvesting
    if (textInputs.length >= 2) {
      return true;
    }
  }

  // 5. No login form indicators were found
  return false;
}
