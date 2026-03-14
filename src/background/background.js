import { analyzeDomain } from './domainAnalyzer.js';

/**
 * PhishGuard AI - Background Service Worker
 * Orchestrates navigation-level security analysis.
 */

// 1. Analyze URLs before page load using webNavigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only analyze main frame (top-level) navigation
  if (details.frameId !== 0) return;

  const url = details.url;
  if (!url || !url.startsWith('http')) return;

  const result = analyzeDomain(url);

  console.log(`[PhishGuard] Preliminary Analysis for ${url}:`, result);

  if (result.riskScore >= 50 && result.suggestedDomain) {
    console.warn(`[PhishGuard] Typosquat detected: ${result.riskScore}. Pre-loading warning...`);

    // Store result to trigger the warning popup in the content script
    chrome.storage.local.set({ [`pending_warning_${details.tabId}`]: result });
  }

  // Update badge immediately
  updateBadge(result.riskScore, details.tabId);
});

// 2. Secondary check on tab completion as a fallback/refinement
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    chrome.storage.local.get([`pending_warning_${tabId}`]).then(res => {
      const result = res[`pending_warning_${tabId}`];
      if (result) {
        chrome.tabs.sendMessage(tabId, {
          type: "PHISHING_WARNING",
          url: result.domain,
          suggestion: result.suggestedDomain
        }).catch(err => {
          console.log("[PhishGuard] Message delivery deferred until script injection.");
        });

        // Clear pending
        chrome.storage.local.remove(`pending_warning_${tabId}`);
      }
    });
  }
});

function updateBadge(score, tabId) {
  let color = score > 50 ? '#ea4335' : (score > 20 ? '#fbbc05' : '#34a853');
  let text = score > 50 ? '!!' : (score > 20 ? '!' : 'OK');

  chrome.action.setBadgeBackgroundColor({ color, tabId });
  chrome.action.setBadgeText({ text, tabId });
}
