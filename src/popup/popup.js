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
    if (score <= 20) return { label: 'SAFE', theme: 'safe', message: 'No phishing indicators detected.' };
    if (score <= 50) return { label: 'SUSPICIOUS', theme: 'suspicious', message: 'This domain shows suspicious signals.' };
    return { label: 'DANGER', theme: 'danger', message: 'Possible phishing website detected.' };
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
    elStatusText.textContent = status.label;
    elCardStatusBadge.textContent = status.label.charAt(0) + status.label.slice(1).toLowerCase();
    elGlobalStatusText.textContent = status.label;

    // Update Themes (Colors)
    const themes = ['theme-safe', 'theme-suspicious', 'theme-danger'];
    const globalThemes = ['safe', 'suspicious', 'danger'];

    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove(...themes);
      card.classList.add(`theme-${status.theme}`);
    });

    elGlobalStatusBadge.classList.remove(...globalThemes);
    elGlobalStatusBadge.classList.add(status.theme);

    // Generate Reasons from Signals
    const reasons = [];
    if (data.signals) {
      if (data.signals.typosquatting) {
        reasons.push("Domain imitates a popular brand.");
      } else {
        reasons.push("No common brand impersonation detected.");
      }

      if (data.signals.suspiciousTLD) {
        reasons.push("Using a TLD commonly used for phishing.");
      } else {
        reasons.push("Domain uses a standard TLD.");
      }

      if (data.signals.phishingKeywords) {
        reasons.push("Phishing keywords found in URL.");
      } else {
        reasons.push("No suspicious keywords in URL.");
      }
    } else if (data.reasons) {
      // Fallback for test buttons or older format
      reasons.push(...data.reasons);
    }

    // Render Reasons
    elReasonsList.innerHTML = `<div class="analysis-summary">${status.message}</div>`;
    reasons.forEach(reason => {
      const isPositive = reason.toLowerCase().includes('no') || reason.toLowerCase().includes('standard');
      const itemTheme = isPositive ? 'pass' : (score > 50 ? 'fail' : 'warn');
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

    // Handle Safe Site Suggestion (Feature 8)
    const suggestionContainer = document.getElementById('suggestion-container');
    suggestionContainer.innerHTML = '';

    if (data.suggestedDomain && score >= 50) {
      const suggestionHtml = `
        <div class="suggestion-box">
          <div class="suggestion-header">
            <span class="warning-icon">⚠</span>
            <span class="warning-title">Possible phishing site</span>
          </div>
          <p class="suggestion-desc">
            You are visiting <strong>${data.domain}</strong>.<br>
            Did you mean <strong>${data.suggestedDomain}</strong>?
          </p>
          <button id="btn-open-safe" class="btn-primary">Open ${data.suggestedDomain}</button>
        </div>
      `;
      suggestionContainer.innerHTML = suggestionHtml;

      document.getElementById('btn-open-safe').onclick = () => {
        window.open(`https://${data.suggestedDomain}`);
      };
    }
  }
});
