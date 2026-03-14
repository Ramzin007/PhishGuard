/**
 * PhishGuard AI - Content Script Warning Popup
 * Listens for phishing warnings and displays a modal to the user.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PHISHING_WARNING") {
        showPhishingPopup(message.url, message.suggestion);
    }
});

function showPhishingPopup(currentUrl, suggestion) {
    // Prevent multiple popups
    if (document.getElementById('phishguard-warning-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'phishguard-warning-overlay';

    // Style strings for cleaner DOM injection
    const css = `
    #phishguard-warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      z-index: 2147483647;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(5px);
    }
    .pg-modal {
      background: #1a1a1a;
      color: #ffffff;
      padding: 40px;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      border: 2px solid #ea4335;
      box-shadow: 0 0 30px rgba(234, 67, 53, 0.3);
    }
    .pg-icon { font-size: 48px; margin-bottom: 20px; }
    .pg-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #ea4335; }
    .pg-text { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #ccc; }
    .pg-url { color: #ffffff; background: #333; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
    .pg-suggestion-box {
      background: rgba(52, 168, 83, 0.1);
      border: 1px solid #34a853;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .pg-suggestion-text { font-size: 14px; margin-bottom: 8px; color: #34a853; }
    .pg-suggestion-url { font-weight: bold; font-size: 18px; color: #34a853; }
    .pg-btn-group { display: flex; flex-direction: column; gap: 12px; }
    .pg-btn {
      padding: 14px;
      border-radius: 6px;
      border: none;
      font-weight: bold;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }
    .pg-btn-safe { background: #34a853; color: white; }
    .pg-btn-safe:hover { background: #2d9249; transform: scale(1.02); }
    .pg-btn-unsafe { background: transparent; color: #888; border: 1px solid #444; }
    .pg-btn-unsafe:hover { color: #bbb; border-color: #666; }
  `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    overlay.innerHTML = `
    <div class="pg-modal">
      <div class="pg-icon">⚠️</div>
      <div class="pg-title">Possible phishing website detected</div>
      
      <p class="pg-text">
        You are visiting a site that appears to be impersonating a trusted brand:<br>
        <span class="pg-url">${currentUrl}</span>
      </p>

      ${suggestion ? `
        <div class="pg-suggestion-box">
          <div class="pg-suggestion-text">Did you mean this official site?</div>
          <div class="pg-suggestion-url">${suggestion}</div>
        </div>
      ` : ''}

      <div class="pg-btn-group">
        <button id="pg-btn-go-safe" class="pg-btn pg-btn-safe">Go to Safe Site</button>
        <button id="pg-btn-continue" class="pg-btn pg-btn-unsafe">Continue Anyway (Not Recommended)</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    // Button handlers
    document.getElementById('pg-btn-go-safe').onclick = () => {
        if (suggestion) {
            window.location.href = `https://${suggestion}`;
        } else {
            overlay.remove();
        }
    };

    document.getElementById('pg-btn-continue').onclick = () => {
        overlay.remove();
    };
}
