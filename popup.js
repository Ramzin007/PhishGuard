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
