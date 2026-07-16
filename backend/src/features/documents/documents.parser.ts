import { parseDocxContent } from "../../lib/parsers/docx";
import { parsePdfBuffer } from "../../lib/parsers/pdf";
import { recognizeTextWithOCR } from "../../lib/parsers/ocr";

async function ocrProviderWrapper(buffer: Buffer): Promise<string> {
  const result = await recognizeTextWithOCR(buffer);
  return result.text || "";
}

export interface ParsedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  metadata: Record<string, string>;
  isOcr: boolean;
}

async function parseTxt(buffer: Buffer, name: string): Promise<ParsedFile> {
  return {
    id: crypto.randomUUID(),
    name,
    size: buffer.byteLength,
    type: "text/plain",
    content: buffer.toString("utf-8"),
    metadata: {},
    isOcr: false,
  };
}

async function parseDocx(buffer: Buffer, name: string): Promise<ParsedFile> {
  const result = await parseDocxContent(buffer, { extractMetadata: true });
  
  return {
    id: crypto.randomUUID(),
    name,
    size: buffer.byteLength,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    content: result.content,
    metadata: result.metadata,
    isOcr: false,
  };
}

async function parsePdf(buffer: Buffer, name: string): Promise<ParsedFile> {
  const result = await parsePdfBuffer(buffer, {
    enableOCR: true,
    ocrProvider: ocrProviderWrapper,
  });
  
  return {
    id: crypto.randomUUID(),
    name,
    size: buffer.byteLength,
    type: "application/pdf",
    content: result.content,
    metadata: result.metadata,
    isOcr: result.isOcr,
  };
}

export async function parseFile(buffer: Buffer, name: string): Promise<ParsedFile> {
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
      return parseTxt(buffer, name);
    case "docx":
      return parseDocx(buffer, name);
    case "pdf":
      return parsePdf(buffer, name);
    default:
      throw new Error(`Format file tidak didukung: .${ext}`);
  }
}