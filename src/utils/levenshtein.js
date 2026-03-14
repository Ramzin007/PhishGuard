/**
 * Calculates the Levenshtein distance between two strings.
 * 
 * Time Complexity: O(n * m)
 * Space Complexity: O(n * m)
 * 
 * @param {string} a 
 * @param {string} b 
 * @returns {number} The edit distance between the two strings.
 */
export function levenshteinDistance(a, b) {
    // Case-insensitive comparison
    const str1 = a.toLowerCase();
    const str2 = b.toLowerCase();

    const n = str1.length;
    const m = str2.length;

    // Create a 2D array (matrix)
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    // Initialize the first row and column
    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // Characters match
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,    // Deletion
                    dp[i][j - 1] + 1,    // Insertion
                    dp[i - 1][j - 1] + 1 // Substitution
                );
            }
        }
    }

    return dp[n][m];
}
