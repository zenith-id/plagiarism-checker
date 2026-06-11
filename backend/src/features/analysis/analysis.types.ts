import type { ParsedFile } from "../files/files.parser";
import type { SimilarityResult } from "./similarity.service";

export interface RankedFile {
  id: string;
  name: string;
  maxSimilarity: number;
  avgSimilarity: number;
  pairCount: number;
  metadataStatus: string;
  metadataReason: string;
  lastModifiedBy: string;
  author: string;
}

export interface PairDetailResponse {
  fileA: ParsedFile & { metadataStatus: string; metadataReason: string };
  fileB: ParsedFile & { metadataStatus: string; metadataReason: string };
  similarity: SimilarityResult | { normalScore: number; strictScore: number; wordOverlap: number; matchedRanges: [] };
  direction: string;
}
