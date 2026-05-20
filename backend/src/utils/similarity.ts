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
    .map((t) => t.replace(/[^\w]/g, ""))
    .filter((t) => t.length > 0);
}

function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const total = tokens.length || 1;
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  for (const [key, val] of tf.entries()) {
    tf.set(key, val / total);
  }
  return tf;
}

function computeIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const n = documents.length || 1;
  for (const doc of documents) {
    const unique = new Set(doc);
    for (const token of unique) {
      idf.set(token, (idf.get(token) || 0) + 1);
    }
  }
  for (const [key, val] of idf.entries()) {
    idf.set(key, Math.log(n / val));
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

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
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
  for (const ng of ngramsA) {
    if (ngramsB.has(ng)) intersection++;
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

function findMatchedRanges(
  textA: string,
  textB: string,
  minWordLength: number = 5
): { a: [number, number]; b: [number, number] }[] {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const ranges: { a: [number, number]; b: [number, number] }[] = [];

  const tokenPositionsA: number[] = [];
  let pos = 0;
  for (const token of tokensA) {
    const idx = textA.toLowerCase().indexOf(token, pos);
    if (idx !== -1) {
      tokenPositionsA.push(idx);
      pos = idx + token.length;
    }
  }

  const tokenPositionsB: number[] = [];
  pos = 0;
  for (const token of tokensB) {
    const idx = textB.toLowerCase().indexOf(token, pos);
    if (idx !== -1) {
      tokenPositionsB.push(idx);
      pos = idx + token.length;
    }
  }

  let i = 0;
  while (i < tokensA.length) {
    let j = 0;
    while (j < tokensB.length) {
      if (tokensA[i] === tokensB[j]) {
        let matchLen = 0;
        while (
          i + matchLen < tokensA.length &&
          j + matchLen < tokensB.length &&
          tokensA[i + matchLen] === tokensB[j + matchLen]
        ) {
          matchLen++;
        }
        if (matchLen >= minWordLength) {
          const startA = tokenPositionsA[i] ?? 0;
          const startB = tokenPositionsB[j] ?? 0;
          const endA = tokenPositionsA[i + matchLen - 1]
            ? startA + tokensA.slice(i, i + matchLen).join(" ").length
            : startA + 10;
          const endB = tokenPositionsB[j + matchLen - 1]
            ? startB + tokensB.slice(j, j + matchLen).join(" ").length
            : startB + 10;
          ranges.push({ a: [startA, endA], b: [startB, endB] });
        }
        i += matchLen;
        j += matchLen;
      } else {
        j++;
      }
    }
    i++;
  }

  return ranges;
}

export function analyzeSimilarity(
  files: { id: string; name: string; content: string }[],
  exclusions: string[] = []
): SimilarityResult[] {
  const results: SimilarityResult[] = [];
  const cleanedFiles = files.map((f) => ({
    ...f,
    cleanedNormal: cleanTextForAlgo(f.content, false, exclusions),
    cleanedStrict: cleanTextForAlgo(f.content, true, exclusions),
  }));

  const allTokensNormal = cleanedFiles.map((f) => tokenize(f.cleanedNormal));
  const idfNormal = computeIDF(allTokensNormal);

  const allTokensStrict = cleanedFiles.map((f) => tokenize(f.cleanedStrict));
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

    for (const exc of exclusions) {
      if (exc.trim()) {
        const regex = new RegExp(exc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        cleaned = cleaned.replace(regex, "");
      }
    }
  }

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}
