/**
 * Logic for injecting the warning overlay into the page.
 */
const overlayUI = {
    inject: function(score, reasons) {
        if (document.getElementById('phish-guard-warning-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'phish-guard-warning-overlay';
        overlay.className = 'phish-guard-overlay';

        const reasonsHtml = reasons.map(r => `<li>${r}</li>`).join('');

        overlay.innerHTML = `
            <div class="phish-guard-card">
                <h1>⚠️ PHISHING ALERT</h1>
                <p>Our real-time analysis has identified this site as highly suspicious. Interacting with this page may put your personal and financial data at risk.</p>
                
                <div class="phish-guard-stats">
                    <strong>Threat Analysis Findings:</strong>
                    <ul class="phish-guard-reasons">${reasonsHtml}</ul>
                    <div style="margin-top: 15px; font-weight: bold; font-size: 1.1rem; display: flex; justify-content: space-between;">
                        <span>Risk Score: <span style="color: #ff4d4d;">${(score * 100).toFixed(0)}%</span></span>
                    </div>
                </div>

                <div class="phish-guard-btn-container">
                    <button id="phish-guard-safe" class="phish-guard-btn phish-guard-btn-primary">Back to Safety</button>
                    <button id="phish-guard-ignore" class="phish-guard-btn phish-guard-btn-secondary">Ignore Risk</button>
                </div>
                
                <div style="margin-top: 30px; font-size: 0.9rem; color: #94a3b8;">
                    Powered by PhishGuard Real-Time Protection
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('phish-guard-safe').onclick = () => {
            window.location.href = 'https://www.google.com';
        };

        document.getElementById('phish-guard-ignore').onclick = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = overlayUI;
}
