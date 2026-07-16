/**
 * PDF parsing utilities
 * Pure functions with minimal dependencies
 */

export interface PdfParseResult {
  content: string;
  metadata: Record<string, string>;
  isOcr: boolean;
  pageCount?: number;
  error?: string;
}

/**
 * Check if PDF is likely scanned/OCR needed
 */
export function isScannedPDF(content: string, minTextLength: number = 50): boolean {
  return content.trim().length < minTextLength;
}

/**
 * Extract metadata from PDF data
 */
export function extractPdfMetadata(data: any): Record<string, string> {
  const metadata: Record<string, string> = {};
  
  if (data.info) {
    if (data.info.Author) metadata.author = data.info.Author;
    if (data.info.Title) metadata.title = data.info.Title;
    if (data.info.Subject) metadata.subject = data.info.Subject;
    if (data.info.Creator) metadata.creator = data.info.Creator;
    if (data.info.Producer) metadata.producer = data.info.Producer;
    if (data.info.CreationDate) metadata.created = data.info.CreationDate;
    if (data.info.ModDate) metadata.modified = data.info.ModDate;
    if (data.info.Keywords) metadata.keywords = data.info.Keywords;
  }
  
  return metadata;
}

/**
 * Parse PDF buffer (wrapper for pdf-parse library)
 * Note: This function has external dependency on pdf-parse
 */
export async function parsePdfBuffer(
  buffer: Buffer,
  options: {
    enableOCR?: boolean;
    ocrProvider?: (buffer: Buffer) => Promise<string>;
    maxPages?: number;
  } = {}
): Promise<PdfParseResult> {
  try {
    // Dynamic import to avoid loading pdf-parse if not needed
    const pdfParse = await import("pdf-parse");
    
    const data = await (pdfParse as any).default(buffer, {
      max: options.maxPages,
    });
    
    let content = data.text || "";
    const metadata = extractPdfMetadata(data);
    
    let isOcr = false;
    const scanned = isScannedPDF(content);
    
    // Apply OCR if enabled and content appears scanned
    if (scanned && options.enableOCR && options.ocrProvider) {
      try {
        const ocrContent = await options.ocrProvider(buffer);
        content = ocrContent || content;
        isOcr = true;
      } catch (ocrError) {
        // OCR failed, keep original content
        console.warn("OCR failed:", ocrError);
      }
    }
    
    return {
      content,
      metadata,
      isOcr,
      pageCount: data.numpages,
    };
    
  } catch (error) {
    return {
      content: "",
      metadata: {},
      isOcr: false,
      error: error instanceof Error ? error.message : "Unknown PDF parsing error",
    };
  }
}