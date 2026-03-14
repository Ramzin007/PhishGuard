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
        injectWarningBanner(response.reasons);
    }
});

function injectWarningBanner(reasons) {
    // Prevent multiple banners
    if (document.getElementById('phishguard-warning-banner')) return;

    const banner = document.createElement("div");
    banner.id = 'phishguard-warning-banner';
    
    // Create Reasons Logic
    const reasonsHtml = (reasons || []).map(r => `<li>${r}</li>`).join('');

    banner.innerHTML = `
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">
            ⚠️ Potential phishing website detected
        </div>
        <div style="font-size: 14px;">Reasons:</div>
        <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 13px;">
            ${reasonsHtml}
        </ul>
    `;

    // Inline styling for banner
    Object.assign(banner.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        backgroundColor: '#ef4444', // red background
        color: '#ffffff', // white text
        zIndex: '2147483647', // high z-index
        padding: '16px 24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
    });

    document.body.prepend(banner);
}
