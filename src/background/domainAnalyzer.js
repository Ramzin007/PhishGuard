import { levenshteinDistance } from '../utils/levenshtein.js';

const popularDomains = [
    { brand: "amazon", domain: "amazon.com" },
    { brand: "paypal", domain: "paypal.com" },
    { brand: "google", domain: "google.com" },
    { brand: "facebook", domain: "facebook.com" },
    { brand: "microsoft", domain: "microsoft.com" }
];

const phishingKeywords = [
    "verify-account",
    "secure-login",
    "update-info",
    "account-security",
    "login-confirm",
    "billing-update"
];

const suspiciousTLDs = [
    ".xyz",
    ".top",
    ".click",
    ".site"
];

/**
 * Extracts the main domain from a given URL.
 */
export function extractDomain(urlString) {
    try {
        const url = new URL(urlString);
        let hostname = url.hostname.toLowerCase();
        const parts = hostname.split('.');
        const commonSLDs = ['co', 'com', 'org', 'net', 'gov', 'edu'];

        if (parts.length > 2) {
            const lastPart = parts[parts.length - 1];
            const secondLastPart = parts[parts.length - 2];
            if (commonSLDs.includes(secondLastPart) && lastPart.length === 2) {
                return parts.slice(-3).join('.');
            } else {
                return parts.slice(-2).join('.');
            }
        }
        return hostname;
    } catch (e) {
        return '';
    }
}

/**
 * Scans URL for phishing keywords.
 */
export function detectPhishingKeywords(url) {
    const lowerUrl = url.toLowerCase();
    const matchedKeywords = phishingKeywords.filter(keyword => lowerUrl.includes(keyword));

    return {
        keywordDetected: matchedKeywords.length > 0,
        keywords: matchedKeywords
    };
}

/**
 * Scans domain for suspicious TLDs.
 */
export function detectSuspiciousTLD(domain) {
    const tld = suspiciousTLDs.find(tld => domain.toLowerCase().endsWith(tld));

    return {
        suspiciousTLD: !!tld,
        tld: tld || null
    };
}

/**
 * Checks for typosquatting and returns a suggested legitimate domain.
 */
export function checkTyposquatting(domain) {
    const domainToken = domain.split(/[-.]/)[0].toLowerCase();

    for (const trusted of popularDomains) {
        const distance = levenshteinDistance(domainToken, trusted.brand);

        if (distance <= 2) {
            // If it's the exact official domain, it's NOT typosquatting
            if (domain.toLowerCase() === trusted.domain.toLowerCase()) {
                return { isTyposquat: false, matchedBrand: trusted.brand, distance: distance };
            }

            return {
                isTyposquat: true,
                matchedBrand: trusted.brand,
                suggestedDomain: trusted.domain,
                distance: distance
            };
        }
    }

    return { isTyposquat: false, matchedBrand: null, distance: -1 };
}

/**
 * Suggests the original site if typosquatting is detected.
 */
export function suggestOriginalSite(domainAnalysisResult) {
    if (domainAnalysisResult.signals.typosquatting && domainAnalysisResult.suggestedDomain) {
        return domainAnalysisResult.suggestedDomain;
    }
    return null;
}

/**
 * Final analysis function with structured output and threat labeling.
 */
export function analyzeDomain(url) {
    const domain = extractDomain(url);

    const typoResult = checkTyposquatting(domain);
    const tldResult = detectSuspiciousTLD(domain);
    const keywordResult = detectPhishingKeywords(url);

    let riskScore = 0;
    const signals = {
        typosquatting: typoResult.isTyposquat,
        suspiciousTLD: tldResult.suspiciousTLD,
        phishingKeywords: keywordResult.keywordDetected
    };

    if (signals.typosquatting) riskScore += 50;
    if (signals.suspiciousTLD) riskScore += 20;
    if (signals.phishingKeywords) riskScore += 20;

    riskScore = Math.min(riskScore, 100);

    let threatLevel = "SAFE";
    if (riskScore >= 51) {
        threatLevel = "HIGH RISK";
    } else if (riskScore >= 21) {
        threatLevel = "SUSPICIOUS";
    }

    return {
        url: url,
        domain: domain,
        riskScore: riskScore,
        threatLevel: threatLevel,
        signals: {
            typosquatting: signals.typosquatting,
            suspiciousTLD: signals.suspiciousTLD,
            phishingKeywords: signals.phishingKeywords
        },
        suggestedDomain: typoResult.suggestedDomain || null
    };
}

/**
 * Legacy support for score calculation only.
 */
export function calculateDomainRisk(url) {
    const result = analyzeDomain(url);
    return {
        domainRisk: result.riskScore,
        signals: {
            typosquatting: result.signals.typosquatting,
            suspiciousTLD: result.signals.suspiciousTLD,
            keywords: result.signals.phishingKeywords
        }
    };
}
