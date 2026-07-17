/**
 * TF-IDF + Cosine Similarity implementation
 * Pure functions without external dependencies
 */

export interface TFIDFResult {
  tf: Map<string, number>;
  idf: Map<string, number>;
}

export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map((token) => token.replace(/[^\w]/g, ""))
    .filter((token) => token.length > 0);
}

export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const total = tokens.length || 1;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  for (const [key, value] of tf.entries()) {
    tf.set(key, value / total);
  }

  return tf;
}

export function computeIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const totalDocuments = documents.length || 1;

  for (const document of documents) {
    const unique = new Set(document);
    for (const token of unique) {
      idf.set(token, (idf.get(token) || 0) + 1);
    }
  }

  for (const [key, value] of idf.entries()) {
    idf.set(key, Math.log(totalDocuments / value));
  }

  return idf;
}

export function cosineSimilarity(
  tfA: Map<string, number>,
  tfB: Map<string, number>,
  idf: Map<string, number>,
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allTerms = new Set([...tfA.keys(), ...tfB.keys()]);
  for (const term of allTerms) {
    const weightA = (tfA.get(term) || 0) * (idf.get(term) || 0);
    const weightB = (tfB.get(term) || 0) * (idf.get(term) || 0);
    dotProduct += weightA * weightB;
    normA += weightA * weightA;
    normB += weightB * weightB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Compute TF-IDF vectors for multiple documents
 */
export function computeTFIDFVectors(documents: string[][]): {
  tfVectors: Map<string, number>[];
  idfVector: Map<string, number>;
} {
  const tfVectors = documents.map(computeTF);
  const idfVector = computeIDF(documents);
  return { tfVectors, idfVector };
}

/**
 * Compute similarity matrix for all document pairs
 */
export function computeSimilarityMatrix(
  tfVectors: Map<string, number>[],
  idfVector: Map<string, number>,
): number[][] {
  const n = tfVectors.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const similarity = cosineSimilarity(tfVectors[i], tfVectors[j], idfVector);
      matrix[i][j] = similarity;
      matrix[j][i] = similarity; // Symmetric
    }
  }

  return matrix;
}