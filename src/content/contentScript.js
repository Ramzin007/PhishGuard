/**
 * src/content/contentScript.js
 * Member 1: Responsible for extracting page data and sending it for analysis.
 */

console.log("[PhishGuard] Content script loaded.");

function extractPageData() {
    const pageData = {
        url: window.location.href,
        title: document.title,
        text: document.body.innerText.substring(0, 5000), // Limit text for performance
        hasLoginForm: !!document.querySelector("input[type='password']")
    };
    return pageData;
}

// Perform initial scan
const data = extractPageData();
console.log("[PhishGuard] Extracted Page Data:", data);

chrome.runtime.sendMessage({
    type: "SCAN_PAGE",
    payload: data
}, (response) => {
    if (chrome.runtime.lastError) {
        console.error("[PhishGuard] Message error:", chrome.runtime.lastError);
        return;
    }
    console.log("[PhishGuard] Analysis received:", response);
    
    // In the final version, this response will trigger Member 4's UI overlay
    if (response && response.riskScore > 60) {
        console.warn("[PhishGuard] HIGH RISK DETECTED:", response.reasons);
    }
});
