/**
 * src/background/background.js
 * Member 1: Orchestrates messaging between content scripts and analysis modules.
 */

import { analyzeRisk } from './riskEngine.js';

console.log("[PhishGuard] Background service worker active.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "SCAN_PAGE") {
        console.log("[PhishGuard] Received scan request for:", request.payload.url);
        
        try {
            // Member 1 calls the integrated Risk Engine
            const result = analyzeRisk(request.payload);
            
            // Return result to content script
            sendResponse(result);
        } catch (error) {
            console.error("[PhishGuard] Analysis failed:", error);
            sendResponse({ riskScore: 0, reasons: ["Analysis failed internally"], error: true });
        }
        
        return true; // Keep channel open for async if needed by other team members
    }
});
