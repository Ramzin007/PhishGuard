/**
 * Main content script for PhishGuard.
 */

async function runPhishGuard() {
    console.log("PhishGuard: Starting analysis...");

    const currentUrl = window.location.href;

    // 1. Content Analysis (performed in page context)
    const contentScore = contentAnalysis.analyze(document);

    // 2. Request Background Analysis (URL + Reputation)
    chrome.runtime.sendMessage({ action: "analyzeSite", url: currentUrl }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("PhishGuard: Error messaging background script", chrome.runtime.lastError);
            return;
        }

        // 3. Aggregate Results
        const isLocalFile = currentUrl.startsWith('file://');
        const results = {
            url: response.urlScore,
            reputation: response.reputationScore,
            content: contentScore,
            communityReports: response.communityReports || 0,
            domainAge: response.domainAge
        };

        const finalRisk = riskScorer.calculate(results, isLocalFile);

        console.log("PhishGuard Analysis Results:", results);
        console.log("Final Risk Calculation:", finalRisk);
        console.log("Is Local File:", isLocalFile);

        // 4. Alert User if Suspicious
        if (finalRisk.isSuspicious) {
            console.warn("PhishGuard: Site is SUSPICIOUS. Injecting overlay...");
            overlayUI.inject(finalRisk.finalScore, finalRisk.reasons);
        } else {
            console.log("PhishGuard: Site deemed safe.");
        }
    });
}

// Ensure analysis runs after page load
if (document.readyState === "complete") {
    runPhishGuard();
} else {
    window.addEventListener("load", runPhishGuard);
}
