/**
 * Logic for checking domain reputation and typosquatting.
 */
const reputation = {
    // Highly trusted domains for comparison
    trustedDomains: [
        'google.com', 'facebook.com', 'amazon.com', 'apple.com', 'microsoft.com',
        'netflix.com', 'paypal.com', 'bankofamerica.com', 'chase.com', 'wellsfargo.com',
        'github.com', 'twitter.com', 'linkedin.com', 'instagram.com'
    ],

    /**
     * Checks if a domain is a known phishing target but slightly misspelled.
     * @param {string} hostname 
     * @returns {number} 0 to 1 risk score
     */
    checkTyposquatting: function(hostname) {
        let maxRisk = 0;
        const target = hostname.toLowerCase();

        for (const trusted of this.trustedDomains) {
            if (target === trusted) return 0; // Exactly matched a trusted domain

            const distance = this.levenshteinDistance(target, trusted);
            
            // If distance is small, it's likely a typosquatting attempt
            // e.g., paypa1.com vs paypal.com (distance 1)
            if (distance > 0 && distance <= 2) {
                maxRisk = Math.max(maxRisk, 0.8);
            } else if (distance === 3) {
                maxRisk = Math.max(maxRisk, 0.4);
            }
        }
        return maxRisk;
    },

    /**
     * Standard Levenshtein Distance algorithm.
     */
    levenshteinDistance: function(s1, s2) {
        const m = s1.length;
        const n = s2.length;
        const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) d[i][0] = i;
        for (let j = 0; j <= n; j++) d[0][j] = j;

        for (let j = 1; j <= n; j++) {
            for (let i = 1; i <= m; i++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                d[i][j] = Math.min(
                    d[i - 1][j] + 1,      // deletion
                    d[i][j - 1] + 1,      // insertion
                    d[i - 1][j - 1] + cost // substitution
                );
            }
        }
        return d[m][n];
    },

    /**
     * Mock function for external reputation check.
     */
    checkBlacklist: async function(hostname) {
        // In a real hackathon, you'd call an API like Google Safe Browsing here.
        // For MVP, we'll return a low random risk or check a local hardcoded list.
        const blacklist = ['evil-site.com', 'secure-login-paypa1.com', 'amaz0n.com'];
        if (blacklist.includes(hostname)) {
            return 1.0;
        }
        return 0;
    }
};

if (typeof module !== 'undefined') {
    module.exports = reputation;
}
