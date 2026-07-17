/**
 * Text cleaning utilities for plagiarism detection
 * Pure functions without external dependencies
 */

export interface CleaningOptions {
  strict: boolean;
  exclusions: string[];
  removeStopWords?: boolean;
  preserveCase?: boolean;
  maxLength?: number;
}

const DEFAULT_STOP_WORDS = [
  "yang", "di", "ke", "dari", "pada", "untuk", "dengan", "adalah", "ini", "itu",
  "the", "and", "of", "to", "in", "a", "is", "that", "for", "on", "with", "as", "by"
];

const DEFAULT_EXCLUSION_PATTERNS = [
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

/**
 * Clean text for similarity analysis
 */
export function cleanTextForAlgo(
  text: string,
  options: CleaningOptions = { strict: false, exclusions: [] }
): string {
  let cleaned = text;

  // Apply strict mode exclusions
  if (options.strict) {
    for (const pattern of DEFAULT_EXCLUSION_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }

    // Apply custom exclusions
    for (const exclusion of options.exclusions) {
      if (exclusion.trim()) {
        const regex = new RegExp(
          exclusion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi",
        );
        cleaned = cleaned.replace(regex, "");
      }
    }
  }

  // Remove stop words if enabled
  if (options.removeStopWords) {
    const stopWords = DEFAULT_STOP_WORDS.join("|");
    const stopWordsRegex = new RegExp(`\\b(${stopWords})\\b`, "gi");
    cleaned = cleaned.replace(stopWordsRegex, "");
  }

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Truncate if max length specified
  if (options.maxLength && cleaned.length > options.maxLength) {
    cleaned = cleaned.substring(0, options.maxLength);
  }

  // Preserve case or convert to lowercase
  if (!options.preserveCase) {
    cleaned = cleaned.toLowerCase();
  }

  return cleaned;
}

/**
 * Clean text in normal mode (default)
 */
export function cleanTextNormal(text: string): string {
  return cleanTextForAlgo(text, {
    strict: false,
    exclusions: [],
    removeStopWords: false,
    preserveCase: false,
  });
}

/**
 * Clean text in strict mode
 */
export function cleanTextStrict(text: string, exclusions: string[] = []): string {
  return cleanTextForAlgo(text, {
    strict: true,
    exclusions,
    removeStopWords: true,
    preserveCase: false,
  });
}

/**
 * Extract metadata from text (headers, footers, etc.)
 */
export function extractTextMetadata(text: string): {
  hasHeader: boolean;
  hasFooter: boolean;
  lineCount: number;
  wordCount: number;
  charCount: number;
} {
  const lines = text.split('\n');
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  // Simple heuristic for header/footer detection
  const firstLine = lines[0]?.trim() || '';
  const lastLine = lines[lines.length - 1]?.trim() || '';
  
  const headerPatterns = [/nama/i, /nim/i, /kelas/i, /mata kuliah/i, /judul/i];
  const footerPatterns = [/daftar pustaka/i, /referensi/i, /bibliografi/i];
  
  const hasHeader = headerPatterns.some(pattern => pattern.test(firstLine));
  const hasFooter = footerPatterns.some(pattern => pattern.test(lastLine));

  return {
    hasHeader,
    hasFooter,
    lineCount: lines.length,
    wordCount: words.length,
    charCount: text.length,
  };
}

/**
 * Normalize text for comparison (lowercase, remove punctuation, normalize whitespace)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with space
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
}

/**
 * Split text into chunks for parallel processing
 */
export function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks;
}