import mammoth from "mammoth";
import * as pdfParse from "pdf-parse";
import ScribeOCR from "scribe.js-ocr";
import { parseStringPromise } from "xml2js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ParsedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  metadata: Record<string, string>;
  isOcr: boolean;
}

async function extractDocxMetadata(buffer: Buffer): Promise<Record<string, string>> {
  const metadata: Record<string, string> = {};
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);
    const coreXml = await zip.file("docProps/core.xml")?.async("string");
    if (coreXml) {
      const result = await parseStringPromise(coreXml);
      const core = result["cp:coreProperties"] || result.coreProperties || {};
      if (core["dc:creator"]?.[0]) metadata.author = core["dc:creator"][0];
      if (core["cp:lastModifiedBy"]?.[0]) metadata.lastModifiedBy = core["cp:lastModifiedBy"][0];
      if (core["dcterms:created"]?.[0]?._) metadata.created = core["dcterms:created"][0]._;
      if (core["dcterms:modified"]?.[0]?._) metadata.modified = core["dcterms:modified"][0]._;
      if (core["dc:title"]?.[0]) metadata.title = core["dc:title"][0];
    }
    const appXml = await zip.file("docProps/app.xml")?.async("string");
    if (appXml) {
      const result = await parseStringPromise(appXml);
      const app = result.Properties || {};
      if (app.Company?.[0]) metadata.company = app.Company[0];
      if (app.TotalTime?.[0]) metadata.totalTime = app.TotalTime[0];
    }
  } catch {
    // metadata kosong jika gagal
  }
  return metadata;
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
  const metadata = await extractDocxMetadata(buffer);
  let content = "";
  try {
    const result = await mammoth.extractRawText({ buffer });
    content = result.value || "";
  } catch {
    content = "";
  }
  return {
    id: crypto.randomUUID(),
    name,
    size: buffer.byteLength,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    content,
    metadata,
    isOcr: false,
  };
}

async function parsePdf(buffer: Buffer, name: string): Promise<ParsedFile> {
  let content = "";
  let metadata: Record<string, string> = {};

  try {
    const data = await (pdfParse as any).default(buffer);
    content = data.text || "";
    if (data.info) {
      if (data.info.Author) metadata.author = data.info.Author;
      if (data.info.Title) metadata.title = data.info.Title;
      if (data.info.Subject) metadata.subject = data.info.Subject;
      if (data.info.Creator) metadata.creator = data.info.Creator;
      if (data.info.Producer) metadata.producer = data.info.Producer;
      if (data.info.CreationDate) metadata.created = data.info.CreationDate;
      if (data.info.ModDate) metadata.modified = data.info.ModDate;
    }
  } catch {
    content = "";
  }

  const isScanned = content.trim().length < 50;
  let isOcr = false;

  if (isScanned) {
    try {
      const ocr = new ScribeOCR();
      await ocr.load();
      const result = await ocr.recognize(buffer);
      content = result?.text || content;
      isOcr = true;
    } catch {
      // OCR gagal
    }
  }

  return {
    id: crypto.randomUUID(),
    name,
    size: buffer.byteLength,
    type: "application/pdf",
    content,
    metadata,
    isOcr,
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

export function cleanText(text: string, strict: boolean = false, exclusions: string[] = []): string {
  let cleaned = text;
  if (strict) {
    const defaults = [
      /nama\s*:\s*.+/gi, /nim\s*:\s*.+/gi, /kelas\s*:\s*.+/gi,
      /mata\s+kuliah\s*:\s*.+/gi, /dosen\s*:\s*.+/gi, /tugas\s*:\s*.+/gi,
      /judul\s*:\s*.+/gi, /program\s+studi\s*:\s*.+/gi, /fakultas\s*:\s*.+/gi,
      /universitas\s*:\s*.+/gi, /institut\s*:\s*.+/gi, /sekolah\s+tinggi\s*:\s*.+/gi,
      /semester\s*:\s*.+/gi, /tahun\s+ajaran\s*:\s*.+/gi, /tanggal\s*:\s*.+/gi,
      /abs\s*:\s*.+/gi, /pendahuluan\s*/gi, /kesimpulan\s*/gi,
      /daftar\s+pustaka\s*/gi, /referensi\s*/gi, /bab\s+[ivx]+/gi,
    ];
    for (const p of defaults) cleaned = cleaned.replace(p, "");
    for (const exc of exclusions) {
      if (exc.trim()) {
        cleaned = cleaned.replace(new RegExp(exc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
      }
    }
  }
  return cleaned.replace(/\s+/g, " ").replace(/[^\w\s.,;:!?()\-]/g, "").toLowerCase().trim();
}
