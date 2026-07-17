/**
 * N-Gram overlap calculation
 * Pure functions without external dependencies
 */

import { tokenize } from "./tf-idf";

/**
 * Generate n-grams from tokenized text
 */
export function generateNGrams(tokens: string[], n: number = 5): Set<string> {
  const ngrams = new Set<string>();
  
  if (tokens.length < n) return ngrams;

  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.add(tokens.slice(i, i + n).join(" "));
  }

  return ngrams;
}

/**
 * Calculate n-gram overlap between two texts
 */
export function ngramOverlap(textA: string, textB: string, n: number = 5): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length < n || tokensB.length < n) return 0;

  const ngramsA = generateNGrams(tokensA, n);
  const ngramsB = generateNGrams(tokensB, n);

  let intersection = 0;
  for (const ngram of ngramsA) {
    if (ngramsB.has(ngram)) intersection++;
  }

  const union = ngramsA.size + ngramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calculate n-gram overlap for multiple n values
 */
export function multiNGramOverlap(
  textA: string,
  textB: string,
  nValues: number[] = [3, 4, 5]
): { [n: number]: number } {
  const results: { [n: number]: number } = {};
  
  for (const n of nValues) {
    results[n] = ngramOverlap(textA, textB, n);
  }

  return results;
}

/**
 * Calculate weighted n-gram score (higher weight for longer n-grams)
 */
export function weightedNGramScore(
  textA: string,
  textB: string,
  nValues: number[] = [3, 4, 5]
): number {
  const overlaps = multiNGramOverlap(textA, textB, nValues);
  let totalWeight = 0;
  let weightedSum = 0;

  // Weight increases with n (longer n-grams are more significant)
  for (const [n, overlap] of Object.entries(overlaps)) {
    const weight = parseInt(n); // Weight = n value
    weightedSum += overlap * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}