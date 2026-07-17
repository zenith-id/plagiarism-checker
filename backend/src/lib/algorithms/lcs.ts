/**
 * LCS (Longest Common Subsequence) word overlap and matched ranges
 * Pure functions without external dependencies
 */

import { tokenize } from "./tf-idf";

export interface MatchedRange {
  a: [number, number];
  b: [number, number];
}

export interface LCSResult {
  overlap: number;
  matchedRanges: MatchedRange[];
  commonWords: string[];
}

/**
 * Calculate word overlap using set intersection
 */
export function lcsWordOverlap(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let matchCount = 0;
  for (const token of setA) {
    if (setB.has(token)) matchCount++;
  }

  const minSize = Math.min(setA.size, setB.size);
  return minSize === 0 ? 0 : matchCount / minSize;
}

/**
 * Find exact matched ranges between two texts
 */
export function findMatchedRanges(
  textA: string,
  textB: string,
  minWordLength: number = 5,
): MatchedRange[] {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const ranges: MatchedRange[] = [];

  // Find positions of tokens in original text
  const tokenPositionsA: number[] = [];
  let position = 0;
  for (const token of tokensA) {
    const index = textA.toLowerCase().indexOf(token, position);
    if (index !== -1) {
      tokenPositionsA.push(index);
      position = index + token.length;
    }
  }

  const tokenPositionsB: number[] = [];
  position = 0;
  for (const token of tokensB) {
    const index = textB.toLowerCase().indexOf(token, position);
    if (index !== -1) {
      tokenPositionsB.push(index);
      position = index + token.length;
    }
  }

  // Find common subsequences
  let i = 0;
  while (i < tokensA.length) {
    let j = 0;
    while (j < tokensB.length) {
      if (tokensA[i] === tokensB[j]) {
        let matchLength = 0;
        while (
          i + matchLength < tokensA.length &&
          j + matchLength < tokensB.length &&
          tokensA[i + matchLength] === tokensB[j + matchLength]
        ) {
          matchLength++;
        }

        if (matchLength >= minWordLength) {
          const startA = tokenPositionsA[i] ?? 0;
          const startB = tokenPositionsB[j] ?? 0;
          const endA = tokenPositionsA[i + matchLength - 1]
            ? startA + tokensA.slice(i, i + matchLength).join(" ").length
            : startA + 10;
          const endB = tokenPositionsB[j + matchLength - 1]
            ? startB + tokensB.slice(j, j + matchLength).join(" ").length
            : startB + 10;
          ranges.push({ a: [startA, endA], b: [startB, endB] });
        }

        i += matchLength;
        j += matchLength;
      } else {
        j++;
      }
    }
    i++;
  }

  return ranges;
}

/**
 * Find longest common subsequence of tokens
 */
export function findLongestCommonSubsequence(tokensA: string[], tokensB: string[]): string[] {
  const m = tokensA.length;
  const n = tokensB.length;
  
  // Initialize DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  
  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensA[i - 1] === tokensB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m, j = n;
  
  while (i > 0 && j > 0) {
    if (tokensA[i - 1] === tokensB[j - 1]) {
      lcs.unshift(tokensA[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}

/**
 * Calculate comprehensive LCS metrics
 */
export function calculateLCSMetrics(textA: string, textB: string): LCSResult {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  
  const overlap = lcsWordOverlap(textA, textB);
  const matchedRanges = findMatchedRanges(textA, textB);
  const commonWords = findLongestCommonSubsequence(tokensA, tokensB);
  
  return {
    overlap,
    matchedRanges,
    commonWords,
  };
}