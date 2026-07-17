/**
 * OCR service wrapper
 * Pure functions with scribe.js-ocr dependency
 */

export interface OCRResult {
  text: string;
  confidence?: number;
  language?: string;
  error?: string;
}

/**
 * OCR provider using scribe.js-ocr
 * Note: This function has external dependency on scribe.js-ocr
 */
export async function recognizeTextWithOCR(
  buffer: Buffer,
  options: {
    language?: string;
    loadModel?: boolean;
  } = {}
): Promise<OCRResult> {
  try {
    // Dynamic import to avoid loading scribe.js-ocr if not needed
    const ScribeOCR = (await import("scribe.js-ocr")).default;
    
    const ocr = new ScribeOCR();
    
    // Load OCR model if enabled (default: true)
    if (options.loadModel !== false) {
      await ocr.load();
    }
    
    const result = await ocr.recognize(buffer);
    
    return {
      text: result?.text || "",
      confidence: result?.confidence,
      language: options.language || "eng",
    };
    
  } catch (error) {
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown OCR error",
    };
  }
}

/**
 * Check if buffer appears to be image data
 */
export function isImageBuffer(buffer: Buffer): boolean {
  // Simple heuristic: check first few bytes for image signatures
  const signature = buffer.slice(0, 4).toString('hex').toLowerCase();
  
  const imageSignatures = [
    '89504e47', // PNG
    'ffd8ffe0', // JPEG
    'ffd8ffe1', // JPEG
    'ffd8ffe2', // JPEG
    'ffd8ffe8', // JPEG
    '47494638', // GIF
    '424d',     // BMP
    '49492a00', // TIFF
    '4d4d002a', // TIFF
  ];
  
  return imageSignatures.some(sig => signature.startsWith(sig));
}

/**
 * Preprocess image buffer for OCR (placeholder for future enhancements)
 */
export async function preprocessImageForOCR(
  buffer: Buffer,
  options: {
    convertToGrayscale?: boolean;
    enhanceContrast?: boolean;
    removeNoise?: boolean;
  } = {}
): Promise<Buffer> {
  // For now, return original buffer
  // Future: integrate with image processing libraries
  return buffer;
}

/**
 * OCR service with preprocessing
 */
export async function enhancedOCR(
  buffer: Buffer,
  options: {
    language?: string;
    preprocess?: boolean;
  } = {}
): Promise<OCRResult> {
  let processedBuffer = buffer;
  
  // Preprocess if enabled
  if (options.preprocess && isImageBuffer(buffer)) {
    processedBuffer = await preprocessImageForOCR(buffer);
  }
  
  return recognizeTextWithOCR(processedBuffer, {
    language: options.language,
  });
}