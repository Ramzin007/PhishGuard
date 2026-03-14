/**
 * content/contentScript.js
 * Entry point for content environment. Extracts data, sends it for analysis,
 * and handles UI injection if a threat is detected.
 */

(async () => {
  try {
    // extractPageData is globally available because domExtractor.js is injected
    // just before this script in manifest.json
    const pageData = extractPageData();

    // Send the extracted data to the background worker
    chrome.runtime.sendMessage(
      { type: 'ANALYZE_PAGE', payload: pageData },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[PhishGuard] Connection to extension failed:', chrome.runtime.lastError.message);
          return;
        }

        if (response && response.riskScore > 60) {
          injectWarningBanner();
        }
      }
    );

  } catch (err) {
    console.error('[PhishGuard] Failed to execute content script:', err);
  }
})();

function injectWarningBanner() {
  if (document.getElementById('phishguard-warning-ui')) return;

  const banner = document.createElement('div');
  banner.id = 'phishguard-warning-ui';
  
  Object.assign(banner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#ff4c4c',
    color: '#ffffff',
    textAlign: 'center',
    padding: '12px 20px',
    zIndex: '2147483647',
    fontFamily: 'sans-serif',
    fontSize: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box'
  });

  const message = document.createElement('span');
  message.textContent = '⚠ Potential phishing website detected. Proceed with extreme caution.';
  message.style.fontWeight = 'bold';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Dismiss';
  Object.assign(closeBtn.style, {
    backgroundColor: 'white',
    color: '#ff4c4c',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  });

  closeBtn.addEventListener('click', () => banner.remove());

  banner.appendChild(message);
  banner.appendChild(closeBtn);
  document.body.prepend(banner);
}
