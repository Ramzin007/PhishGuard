/**
 * Logic for analyzing webpage content for phishing indicators.
 */
const contentAnalysis = {
    /**
     * Scans the document for suspicious elements.
     * @returns {number} 0 to 1 risk score
     */
    analyze: function(doc) {
        let score = 0;

        // 1. Check for sensitive inputs (password)
        const passwordInputs = doc.querySelectorAll('input[type="password"]');
        if (passwordInputs.length > 0) {
            score += 0.5;
        }

        // 2. Check for sensitive keywords in document text
        const sensitiveKeywords = ['social security', 'credit card', 'cvv', 'birth date', 'national id'];
        const bodyText = doc.body ? doc.body.innerText.toLowerCase() : "";
        sensitiveKeywords.forEach(keyword => {
            if (bodyText.includes(keyword)) {
                score += 0.3;
            }
        });

        // 3. Check for external form actions
        const forms = doc.querySelectorAll('form');
        const currentDomain = window.location.hostname;
        forms.forEach(form => {
            const action = form.getAttribute('action');
            if (action && action.startsWith('http')) {
                try {
                    const actionUrl = new URL(action);
                    if (actionUrl.hostname !== currentDomain) {
                        score += 0.5;
                    }
                } catch (e) {}
            }
        });

        // 4. Check for meta refresh (common in phishing redirects)
        const metaRefresh = doc.querySelector('meta[http-equiv="refresh"]');
        if (metaRefresh) {
            score += 0.4;
        }

        // 5. Link mismatch detection (e.g., <a href="bad.com">paypal.com</a>)
        const links = doc.querySelectorAll('a');
        links.forEach(link => {
            const text = link.innerText.trim();
            const href = link.getAttribute('href');
            if (href && href.startsWith('http') && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text)) {
                try {
                    const hrefUrl = new URL(href);
                    if (text.toLowerCase() !== hrefUrl.hostname.toLowerCase() && !hrefUrl.hostname.endsWith('.' + text)) {
                        score += 0.1; // Minor boost per mismatched link
                    }
                } catch (e) {}
            }
        });

        return Math.min(score, 1.0);
    }
};

if (typeof module !== 'undefined') {
    module.exports = contentAnalysis;
}
