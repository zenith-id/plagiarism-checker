import {
  tokenize,
  computeTF,
  computeIDF,
  cosineSimilarity,
} from "../../lib/algorithms/tf-idf";
import { ngramOverlap } from "../../lib/algorithms/n-gram";
import {
  lcsWordOverlap,
  findMatchedRanges,
} from "../../lib/algorithms/lcs";
import { cleanTextForAlgo } from "../../lib/text-utils/cleaner";

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

export function analyzeSimilarity(
  files: { id: string; name: string; content: string }[],
  exclusions: string[] = [],
): SimilarityResult[] {
  const results: SimilarityResult[] = [];
  const cleanedFiles = files.map((file) => ({
    ...file,
    cleanedNormal: cleanTextForAlgo(file.content, { strict: false, exclusions }),
    cleanedStrict: cleanTextForAlgo(file.content, { strict: true, exclusions }),
  }));

  const allTokensNormal = cleanedFiles.map((file) =>
    tokenize(file.cleanedNormal),
  );
  const idfNormal = computeIDF(allTokensNormal);
  const allTokensStrict = cleanedFiles.map((file) =>
    tokenize(file.cleanedStrict),
  );
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
      const ngramStrict = ngramOverlap(
        fileA.cleanedStrict,
        fileB.cleanedStrict,
        5,
      );
      const strictScore = cosineStrict * 0.7 + ngramStrict * 0.3;

      const wordOverlap = lcsWordOverlap(
        fileA.cleanedNormal,
        fileB.cleanedNormal,
      );
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