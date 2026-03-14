/**
 * popup/popup.js
 * Requests analysis data from the background script and updates the DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
  const elLoading = document.getElementById('loading');
  const elResults = document.getElementById('results');
  const elUrlDisplay = document.getElementById('site-url');
  const elRiskScore = document.getElementById('risk-score');
  const elReasonsList = document.getElementById('reasons-list');
  
  const elCardStatusBadge = document.getElementById('card-status-badge');
  const elGlobalStatusBadge = document.getElementById('global-status-badge');
  const elGlobalStatusText = document.getElementById('global-status-text');
  const elMeterPath = document.getElementById('meter-path');
  const elStatusText = document.getElementById('status-text');
  
  const elLinearFill = document.getElementById('linear-fill');
  const elLinearIndicator = document.getElementById('linear-indicator');

  // Set up testing buttons
  document.querySelectorAll('.test-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const score = parseInt(e.target.dataset.score, 10);
      renderResults({
        riskScore: score,
        reasons: [
          "Domain depth resembles standard structure.",
          "Connection uses secure HTTPS protocol.",
          score > 30 ? "Some suspicious keywords detected." : "No suspicious keywords.",
          score > 60 ? "Login form found on non-trusted domain." : "Form structure is normal."
        ]
      });
    });
  });

  // Query the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const activeTab = tabs[0];
    
    // Display hostname quickly
    try {
      const url = new URL(activeTab.url);
      elUrlDisplay.textContent = url.hostname;
    } catch {
      elUrlDisplay.textContent = 'Unknown URL';
    }

    // Ignore internal chrome pages
    if (activeTab.url.startsWith('chrome://')) {
      renderResults({ riskScore: 0, reasons: ['Browser internal page.'] });
      return;
    }

    // Request the stored risk analysis from the background script
    chrome.runtime.sendMessage(
      { type: 'GET_RESULT', tabId: activeTab.id },
      (response) => {
        if (chrome.runtime.lastError || !response) {
          setTimeout(() => {
            chrome.runtime.sendMessage(
              { type: 'GET_RESULT', tabId: activeTab.id },
              (retryResponse) => {
                if (retryResponse) {
                  renderResults(retryResponse);
                } else {
                  renderResults({ riskScore: 0, reasons: ['Analysis pending or not available for this page.'] });
                }
              }
            );
          }, 1000);
        } else {
          renderResults(response);
        }
      }
    );
  });

  function getStatusFromScore(score) {
    if (score <= 30) return { label: 'Safe', theme: 'safe' };
    if (score <= 60) return { label: 'Suspicious', theme: 'suspicious' };
    return { label: 'Danger', theme: 'danger' };
  }

  function renderResults(data) {
    elLoading.classList.remove('active');
    elResults.classList.add('active');

    const score = data.riskScore || 0;
    const status = getStatusFromScore(score);

    // Update Score Text
    elRiskScore.textContent = score;
    
    // Update Circular Meter (dashoffset 251.2 at 0, 0 at 100)
    const meterOffset = 251.2 - (251.2 * score) / 100;
    elMeterPath.style.strokeDashoffset = meterOffset;
    
    // Update Linear Meter Indicator
    elLinearIndicator.style.left = `${score}%`;

    // Update Status Texts & Badges
    elStatusText.textContent = status.label.toUpperCase();
    elCardStatusBadge.textContent = status.label;
    elGlobalStatusText.textContent = status.label.toUpperCase();

    // Update Themes (Colors)
    const themes = ['theme-safe', 'theme-suspicious', 'theme-danger'];
    const globalThemes = ['safe', 'suspicious', 'danger'];

    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove(...themes);
        card.classList.add(`theme-${status.theme}`);
    });

    elGlobalStatusBadge.classList.remove(...globalThemes);
    elGlobalStatusBadge.classList.add(status.theme);

    // Render Reasons
    elReasonsList.innerHTML = '';
    (data.reasons || []).forEach(reason => {
      // Mock parsing for the pass/fail styling based on context
      const isPositive = reason.toLowerCase().includes('no') || reason.toLowerCase().includes('secure') || reason.toLowerCase().includes('normal');
      const itemTheme = isPositive ? 'pass' : (score > 60 ? 'fail' : 'warn');
      const badgeText = isPositive ? 'PASS' : (itemTheme === 'fail' ? 'FAIL' : 'WARN');

      const itemHtml = `
        <div class="detail-item ${itemTheme}">
          <div class="detail-icon">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${isPositive 
                  ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                  : '<line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
             </svg>
          </div>
          <div class="detail-text">${reason}</div>
          <div class="detail-badge">${badgeText}</div>
        </div>
      `;
      elReasonsList.insertAdjacentHTML('beforeend', itemHtml);
    });
  }
});
