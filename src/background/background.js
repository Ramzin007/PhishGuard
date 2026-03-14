/**
 * background/background.js
 * Service Worker: Orchestrates messaging and invokes the risk engine.
 */
import { analyzeRisk } from './riskEngine.js';

// Cache results so the popup can retrieve them instantly without re-analyzing
const analysisCache = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_PAGE') {
    const tabId = sender.tab.id;
    const pageData = request.payload;

    try {
      // Run modular risk analysis
      const result = analyzeRisk(pageData);
      
      // Store result in local memory for popup UI
      analysisCache[tabId] = result;
      
      // Also persist to Chrome storage so it survives service worker sleep
      chrome.storage.local.set({ [`risk_${tabId}`]: result });

      // Send response back to the content script synchronously
      sendResponse(result);
    } catch (error) {
      console.error('[PhishGuard] Analysis error:', error);
      sendResponse({ error: 'Failed to complete analysis' });
    }
    
  } else if (request.type === 'GET_RESULT') {
    // The Popup UI asks for the result
    const tabId = request.tabId;
    if (analysisCache[tabId]) {
      sendResponse(analysisCache[tabId]);
    } else {
      chrome.storage.local.get([`risk_${tabId}`], (data) => {
        sendResponse(data[`risk_${tabId}`] || null);
      });
      return true; // asynchronous response via storage
    }
  }
});

// Clean up cache when tabs close
chrome.tabs.onRemoved.addListener((tabId) => {
  delete analysisCache[tabId];
  chrome.storage.local.remove(`risk_${tabId}`);
});
