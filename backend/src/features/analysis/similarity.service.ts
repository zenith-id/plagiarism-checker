export interface SimilarityResult {
  fileAId: string;
  fileBId: string;
  fileAName: string;
  fileBName: string;
  normalScore: number;
  strictScore: number;
  wordOverlap: number;
  matchedRanges: { a: [number, number]; b: [number, number] }[];
}

function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map((token) => token.replace(/[^\w]/g, ""))
    .filter((token) => token.length > 0);
}

function computeTF(tokens: string[]): Map<string, number> {
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

function computeIDF(documents: string[][]): Map<string, number> {
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

function cosineSimilarity(tfA: Map<string, number>, tfB: Map<string, number>, idf: Map<string, number>): number {
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

function ngramOverlap(textA: string, textB: string, n: number = 5): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length < n || tokensB.length < n) return 0;

  const ngramsA = new Set<string>();
  const ngramsB = new Set<string>();

  for (let i = 0; i <= tokensA.length - n; i++) {
    ngramsA.add(tokensA.slice(i, i + n).join(" "));
  }

  for (let i = 0; i <= tokensB.length - n; i++) {
    ngramsB.add(tokensB.slice(i, i + n).join(" "));
  }

  let intersection = 0;
  for (const ngram of ngramsA) {
    if (ngramsB.has(ngram)) intersection++;
  }

  const union = ngramsA.size + ngramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function lcsWordOverlap(textA: string, textB: string): number {
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

function findMatchedRanges(textA: string, textB: string, minWordLength: number = 5): { a: [number, number]; b: [number, number] }[] {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const ranges: { a: [number, number]; b: [number, number] }[] = [];

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

  let i = 0;
  while (i < tokensA.length) {
    let j = 0;
    while (j < tokensB.length) {
      if (tokensA[i] === tokensB[j]) {
        let matchLength = 0;
        while (
          i + matchLength < tokensA.length
          && j + matchLength < tokensB.length
          && tokensA[i + matchLength] === tokensB[j + matchLength]
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

function cleanTextForAlgo(text: string, strict: boolean = false, exclusions: string[] = []): string {
  let cleaned = text;

  if (strict) {
    const defaultExclusions = [
      /nama\s*:\s*.+/gi,
      /nim\s*:\s*.+/gi,
      /kelas\s*:\s*.+/gi,
      /mata\s+kuliah\s*:\s*.+/gi,
      /dosen\s*:\s*.+/gi,
      /tugas\s*:\s*.+/gi,
      /judul\s*:\s*.+/gi,
      /program\s+studi\s*:\s*.+/gi,
      /fakultas\s*:\s*.+/gi,
      /universitas\s*:\s*.+/gi,
      /institut\s*:\s*.+/gi,
      /sekolah\s+tinggi\s*:\s*.+/gi,
      /semester\s*:\s*.+/gi,
      /tahun\s+ajaran\s*:\s*.+/gi,
      /tanggal\s*:\s*.+/gi,
      /abs\s*:\s*.+/gi,
      /pendahuluan\s*/gi,
      /kesimpulan\s*/gi,
      /daftar\s+pustaka\s*/gi,
      /referensi\s*/gi,
      /bab\s+[ivx]+/gi,
    ];

    for (const pattern of defaultExclusions) {
      cleaned = cleaned.replace(pattern, "");
    }

    for (const exclusion of exclusions) {
      if (exclusion.trim()) {
        const regex = new RegExp(exclusion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        cleaned = cleaned.replace(regex, "");
      }
    }
  }

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

export function analyzeSimilarity(
  files: { id: string; name: string; content: string }[],
  exclusions: string[] = [],
): SimilarityResult[] {
  const results: SimilarityResult[] = [];
  const cleanedFiles = files.map((file) => ({
    ...file,
    cleanedNormal: cleanTextForAlgo(file.content, false, exclusions),
    cleanedStrict: cleanTextForAlgo(file.content, true, exclusions),
  }));

  const allTokensNormal = cleanedFiles.map((file) => tokenize(file.cleanedNormal));
  const idfNormal = computeIDF(allTokensNormal);
  const allTokensStrict = cleanedFiles.map((file) => tokenize(file.cleanedStrict));
  const idfStrict = computeIDF(allTokensStrict);

  for (let i = 0; i < cleanedFiles.length; i++) {
    for (let j = i + 1; j < cleanedFiles.length; j++) {
      const fileA = cleanedFiles[i];
      const fileB = cleanedFiles[j];

      if (fileA.name.toLowerCase() === fileB.name.toLowerCase()) continue;

      const tfA = computeTF(tokenize(fileA.cleanedNormal));
      const tfB = computeTF(tokenize(fileB.cleanedNormal));
      const cosine = cosineSimilarity(tfA, tfB, idfNormal);
      const ngram = ngramOverlap(fileA.cleanedNormal, fileB.cleanedNormal, 5);
      const normalScore = cosine * 0.7 + ngram * 0.3;

      const tfAStrict = computeTF(tokenize(fileA.cleanedStrict));
      const tfBStrict = computeTF(tokenize(fileB.cleanedStrict));
      const cosineStrict = cosineSimilarity(tfAStrict, tfBStrict, idfStrict);
      const ngramStrict = ngramOverlap(fileA.cleanedStrict, fileB.cleanedStrict, 5);
      const strictScore = cosineStrict * 0.7 + ngramStrict * 0.3;

      const wordOverlap = lcsWordOverlap(fileA.cleanedNormal, fileB.cleanedNormal);
      const matchedRanges = findMatchedRanges(fileA.content, fileB.content);

      results.push({
        fileAId: fileA.id,
        fileBId: fileB.id,
        fileAName: fileA.name,
        fileBName: fileB.name,
        normalScore: Math.round(normalScore * 10000) / 100,
        strictScore: Math.round(strictScore * 10000) / 100,
        wordOverlap: Math.round(wordOverlap * 10000) / 100,
        matchedRanges,
      });
    }
  }

  return results.sort((a, b) => b.normalScore - a.normalScore);
}
