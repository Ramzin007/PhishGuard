// Logic for the popup dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch initial stats
    chrome.storage.local.get(['scanCount'], (result) => {
        const count = result.scanCount || 0;
        document.getElementById('scan-count').innerText = count.toLocaleString();
    });

    // Get current tab URL and fetch reports
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
        const url = tab.url;
        try {
            const hostname = new URL(url).hostname;
            
            // Get reports for current hostname
            chrome.storage.local.get(['communityReports'], (result) => {
                const reports = result.communityReports || {};
                const reportCount = reports[hostname] || 0;
                document.getElementById('community-reports').innerText = reportCount;
            });

            // Fetch domain age via background analysis
            chrome.runtime.sendMessage({ action: "analyzeSite", url: url }, (response) => {
                if (response && response.domainAge) {
                    const age = response.domainAge;
                    const badge = document.getElementById('domain-age-badge');
                    const value = document.getElementById('domain-age-value');
                    
                    value.innerText = age.label;
                    
                    if (age.ageInDays < 30) {
                        badge.style.background = "rgba(239, 68, 68, 0.2)";
                        badge.style.color = "#ef4444";
                    } else if (age.ageInDays < 365) {
                        badge.style.background = "rgba(245, 158, 11, 0.2)";
                        badge.style.color = "#f59e0b";
                    }
                }
            });

            // Report button handler
            const reportBtn = document.getElementById('report-unsafe');
            reportBtn.onclick = () => {
                chrome.runtime.sendMessage({ action: "reportUnsafe", url: url }, (response) => {
                    if (response && response.success) {
                        document.getElementById('community-reports').innerText = response.count;
                        document.getElementById('report-status').style.display = 'block';
                        reportBtn.disabled = true;
                        reportBtn.style.opacity = '0.5';
                    }
                });
            };
        } catch (e) {
            console.error("Invalid URL in popup", e);
        }
    }
});
