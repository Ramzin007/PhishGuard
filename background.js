importScripts('lib/urlAnalysis.js', 'lib/reputation.js', 'lib/contentAnalysis.js', 'lib/riskScorer.js');

console.log("PhishGuard background script loaded (V3).");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeSite") {
    const url = request.url;
    console.log(`PhishGuard: Analyzing site - ${url}`);

    // Increment scan count in storage
    chrome.storage.local.get(['scanCount'], (result) => {
        const newCount = (result.scanCount || 0) + 1;
        chrome.storage.local.set({ scanCount: newCount });
    });
    
    let hostname = "";
    try {
        hostname = new URL(url).hostname;
    } catch (e) {
        console.warn("PhishGuard: Invalid URL in background analysis", url);
    }

    // Perform background-only checks (URL Heuristics + Reputation)
    const urlScore = urlAnalysis.analyze(url);
    
    // Typosquatting and blacklist check
    reputation.checkBlacklist(hostname).then(async blacklistScore => {
        const typosquattingScore = reputation.checkTyposquatting(hostname);
        
        // Fetch community reports from storage
        const storageResult = await chrome.storage.local.get(['communityReports']);
        const reports = storageResult.communityReports || {};
        const reportCount = reports[hostname] || 0;
        
        const reputationScore = Math.max(blacklistScore, typosquattingScore);

        // Send back results including community reports
        sendResponse({
            urlScore: urlScore,
            reputationScore: reputationScore,
            communityReports: reportCount
        });
    });

    return true; // Keep channel open for async response
  }

  if (request.action === "reportUnsafe") {
    const url = request.url;
    try {
        const hostname = new URL(url).hostname;
        chrome.storage.local.get(['communityReports'], (result) => {
            const reports = result.communityReports || {};
            reports[hostname] = (reports[hostname] || 0) + 1;
            chrome.storage.local.set({ communityReports: reports }, () => {
                console.log(`PhishGuard: Reported ${hostname}. Total reports: ${reports[hostname]}`);
                sendResponse({ success: true, count: reports[hostname] });
            });
        });
    } catch (e) {
        sendResponse({ success: false, error: "Invalid URL" });
    }
    return true;
  }
});
