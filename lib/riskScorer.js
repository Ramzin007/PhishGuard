/**
 * Engine for aggregating analysis results into a final risk score.
 */
const riskScorer = {
    weights: {
        url: 0.20,
        reputation: 0.50,
        content: 0.30
    },

    /**
     * Calculates the final risk score.
     * @param {Object} results - Scores from different modules
     * @param {boolean} isLocalFile - Whether the analysis is on a local file
     * @returns {Object} { finalScore, isSuspicious, reasons }
     */
    calculate: function(results, isLocalFile = false) {
        let weightedScore = 0;
        const reasons = [];

        // Dynamic weighting if it's a local file (where reputation/url context is limited)
        const currentWeights = isLocalFile ? {
            url: 0.1,
            reputation: 0,
            content: 0.9
        } : this.weights;

        if (results.url > 0) {
            weightedScore += results.url * currentWeights.url;
            if (results.url > 0.5) reasons.push("Suspicious URL pattern or structure detected");
        }

        if (results.reputation > 0 && !isLocalFile) {
            weightedScore += results.reputation * currentWeights.reputation;
            if (results.reputation > 0.7) reasons.push("Domain looks like a misspelled popular site (Typosquatting)");
            else if (results.reputation > 0.3) reasons.push("Site reputation is untrusted or unknown");
        }

        if (results.content > 0) {
            weightedScore += results.content * currentWeights.content;
            if (results.content > 0.5) reasons.push("Highly suspicious content: Fake login form or sensitive request found");
        }

        // Add risk from community reports
        if (results.communityReports > 0) {
            const reportScore = Math.min(results.communityReports * 0.15, 0.4); // Max 40% impact from reports
            weightedScore += reportScore;
            reasons.push(`${results.communityReports} community users reported this site as unsafe`);
        }

        // Add risk from Domain Age
        if (results.domainAge && results.domainAge.riskScore > 0 && !isLocalFile) {
            const ageRisk = results.domainAge.riskScore * 0.3; // 30% weight for age
            weightedScore += ageRisk;
            if (results.domainAge.ageInDays < 30) {
                reasons.push(`EXTREME RISK: This domain was registered only ${results.domainAge.ageInDays} days ago`);
            }
        }

        const threshold = isLocalFile ? 0.25 : 0.30; 
        return {
            finalScore: Math.min(weightedScore, 1.0),
            isSuspicious: weightedScore >= threshold,
            reasons: reasons
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = riskScorer;
}
