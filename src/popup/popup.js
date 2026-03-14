/**
 * popup/popup.js
 * Requests analysis data from the background script and updates the DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
  const elLoading = document.getElementById('loading');
  const elResults = document.getElementById('results');
  const elUrlDisplay = document.getElementById('site-url');
  const elScoreContainer = document.getElementById('score-container');
  const elRiskScore = document.getElementById('risk-score');
  const elReasonsList = document.getElementById('reasons-list');

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

  function renderResults(data) {
    elLoading.classList.remove('active');
    elResults.classList.add('active');

    elRiskScore.textContent = data.riskScore;

    if (data.riskScore > 60) {
      elScoreContainer.className = 'score-container danger';
    } else {
      elScoreContainer.className = 'score-container safe';
    }

    elReasonsList.innerHTML = '';
    (data.reasons || []).forEach(reason => {
      const li = document.createElement('li');
      li.textContent = reason;
      elReasonsList.appendChild(li);
    });
  }
});
