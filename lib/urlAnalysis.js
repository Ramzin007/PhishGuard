/**
 * Heuristics for detecting suspicious URL patterns.
 */
const urlAnalysis = {
    /**
     * Analyzes a URL and returns a risk score (0 to 1).
     * @param {string} urlString 
     * @returns {number} 
     */
    analyze: function(urlString) {
        let score = 0;
        try {
            const url = new URL(urlString);
            const hostname = url.hostname;

            // 1. Check for IP address in hostname
            const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (ipRegex.test(hostname)) {
                score += 0.7;
            }

            // 2. Check URL length
            if (urlString.length > 75) {
                score += 0.2;
            }

            // 3. Count subdomains
            const parts = hostname.split('.');
            if (parts.length > 4) {
                score += 0.3;
            }

            // 4. Check for "@" symbol in URL (userinfo part)
            if (urlString.includes('@')) {
                score += 0.4;
            }

            // 5. Check for suspicious keywords in subdomains
            const suspiciousKeywords = ['login', 'secure', 'verify', 'update', 'banking', 'account', 'signin'];
            const subdomainParts = parts.slice(0, -2); // Exclude domain and TLD
            subdomainParts.forEach(part => {
                suspiciousKeywords.forEach(keyword => {
                    if (part.toLowerCase().includes(keyword)) {
                        score += 0.15;
                    }
                });
            });

            // 6. Check for multiple hyphens in domain
            const hyphenCount = (hostname.match(/-/g) || []).length;
            if (hyphenCount > 2) {
                score += 0.2;
            }

        } catch (e) {
            console.error("Invalid URL:", urlString);
            return 0;
        }

        return Math.min(score, 1.0);
    }
};

if (typeof module !== 'undefined') {
    module.exports = urlAnalysis;
}
