/**
 * DOCX parsing utilities
 * Pure functions with minimal dependencies
 */

export interface DocxParseResult {
  content: string;
  metadata: Record<string, string>;
  error?: string;
}

export interface DocxMetadata {
  author?: string;
  lastModifiedBy?: string;
  created?: string;
  modified?: string;
  title?: string;
  company?: string;
  totalTime?: string;
  revision?: string;
  pages?: string;
  words?: string;
  characters?: string;
}

/**
 * Extract metadata from DOCX buffer
 */
export async function extractDocxMetadata(buffer: Buffer): Promise<DocxMetadata> {
  const metadata: DocxMetadata = {};

  try {
    // Dynamic import to avoid loading jszip/xml2js if not needed
    const JSZip = (await import("jszip")).default;
    const { parseStringPromise } = await import("xml2js");
    
    const zip = await JSZip.loadAsync(buffer);
    
    // Extract core properties (docProps/core.xml)
    const coreXml = await zip.file("docProps/core.xml")?.async("string");
    if (coreXml) {
      const result = await parseStringPromise(coreXml);
      const core = result["cp:coreProperties"] || result.coreProperties || {};
      
      if (core["dc:creator"]?.[0]) metadata.author = core["dc:creator"][0];
      if (core["cp:lastModifiedBy"]?.[0]) metadata.lastModifiedBy = core["cp:lastModifiedBy"][0];
      if (core["dcterms:created"]?.[0]?._) metadata.created = core["dcterms:created"][0]._;
      if (core["dcterms:modified"]?.[0]?._) metadata.modified = core["dcterms:modified"][0]._;
      if (core["dc:title"]?.[0]) metadata.title = core["dc:title"][0];
      if (core["dc:subject"]?.[0]) metadata.revision = core["dc:subject"][0];
    }
    
    // Extract application properties (docProps/app.xml)
    const appXml = await zip.file("docProps/app.xml")?.async("string");
    if (appXml) {
      const result = await parseStringPromise(appXml);
      const app = result.Properties || {};
      
      if (app.Company?.[0]) metadata.company = app.Company[0];
      if (app.TotalTime?.[0]) metadata.totalTime = app.TotalTime[0];
      if (app.Pages?.[0]) metadata.pages = app.Pages[0];
      if (app.Words?.[0]) metadata.words = app.Words[0];
      if (app.Characters?.[0]) metadata.characters = app.Characters[0];
    }
    
  } catch (error) {
    // Metadata extraction failed, return empty metadata
    console.warn("DOCX metadata extraction failed:", error);
  }
  
  return metadata;
}

/**
 * Parse DOCX content (wrapper for mammoth library)
 * Note: This function has external dependency on mammoth
 */
export async function parseDocxContent(
  buffer: Buffer,
  options: {
    extractMetadata?: boolean;
    includeFormatting?: boolean;
  } = {}
): Promise<DocxParseResult> {
  try {
    // Dynamic import to avoid loading mammoth if not needed
    const mammoth = await import("mammoth");
    
    let content = "";
    const metadata: Record<string, string> = {};
    
    // Extract content
    try {
      const result = await mammoth.extractRawText({ buffer });
      content = result.value || "";
    } catch (contentError) {
      console.warn("DOCX content extraction failed:", contentError);
    }
    
    // Extract metadata if enabled
    if (options.extractMetadata !== false) {
      const docxMetadata = await extractDocxMetadata(buffer);
      Object.assign(metadata, docxMetadata);
    }
    
    return {
      content,
      metadata,
    };
    
  } catch (error) {
    return {
      content: "",
      metadata: {},
      error: error instanceof Error ? error.message : "Unknown DOCX parsing error",
    };
  }
}