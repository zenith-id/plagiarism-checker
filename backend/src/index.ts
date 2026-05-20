import { Hono } from "hono";
import { cors } from "hono/cors";
import PDFDocument from "pdfkit";
import { parseFile, type ParsedFile } from "./utils/parser";
import { analyzeSimilarity, type SimilarityResult } from "./utils/similarity";

const MAX_FILES = 200;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface AppState {
  files: ParsedFile[];
  results: SimilarityResult[];
  settings: {
    thresholdSafe: number;
    thresholdWarning: number;
    thresholdDanger: number;
    courseExclusions: Record<string, string[]>;
  };
}

const state: AppState = {
  files: [],
  results: [],
  settings: {
    thresholdSafe: 30,
    thresholdWarning: 60,
    thresholdDanger: 80,
    courseExclusions: {},
  },
};

const app = new Hono();

app.use("/api/*", cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

function checkMetadataSuspicion(metadata: Record<string, string>): { status: string; reason: string } {
  const lastModifiedBy = metadata.lastSavedBy || metadata.lastModifiedBy || "";
  const author = metadata.author || metadata.creator || "";
  const authors = metadata.authors || "";
  if (!lastModifiedBy || (!author && !authors)) return { status: "Aman", reason: "Metadata tidak lengkap" };
  const authorList = authors ? authors.split(",").map((a) => a.trim()) : [author];
  for (const a of authorList) {
    if (a.toLowerCase() === lastModifiedBy.toLowerCase()) return { status: "Aman", reason: "LastModifiedBy sama dengan Author" };
  }
  return { status: "Mencurigakan", reason: "LastModifiedBy berbeda dengan Author" };
}

function getFileRanking(files: ParsedFile[], results: SimilarityResult[]) {
  const fileMap = new Map<string, { similarities: number[]; metadata: Record<string, string>; name: string }>();
  for (const file of files) fileMap.set(file.id, { similarities: [], metadata: file.metadata, name: file.name });
  for (const result of results) {
    const entryA = fileMap.get(result.fileAId);
    const entryB = fileMap.get(result.fileBId);
    if (entryA) entryA.similarities.push(result.normalScore);
    if (entryB) entryB.similarities.push(result.normalScore);
  }
  const ranking: any[] = [];
  for (const [id, data] of fileMap.entries()) {
    const maxSimilarity = data.similarities.length > 0 ? Math.max(...data.similarities) : 0;
    const avgSimilarity = data.similarities.length > 0
      ? Math.round((data.similarities.reduce((a, b) => a + b, 0) / data.similarities.length) * 100) / 100
      : 0;
    const metaCheck = checkMetadataSuspicion(data.metadata);
    ranking.push({
      id,
      name: data.name,
      maxSimilarity,
      avgSimilarity,
      pairCount: data.similarities.length,
      metadataStatus: metaCheck.status,
      metadataReason: metaCheck.reason,
      lastModifiedBy: data.metadata.lastSavedBy || data.metadata.lastModifiedBy || "-",
      author: data.metadata.author || data.metadata.creator || data.metadata.authors || "-",
    });
  }
  return ranking.sort((a, b) => b.maxSimilarity - a.maxSimilarity);
}

function detectDirection(fileA: ParsedFile, fileB: ParsedFile, result?: SimilarityResult): string {
  if (!result) return "Tidak dapat ditentukan";
  const lenA = fileA.content.length;
  const lenB = fileB.content.length;
  if (lenA > lenB * 1.5) return `${fileB.name} kemungkinan menyalin dari ${fileA.name}`;
  if (lenB > lenA * 1.5) return `${fileA.name} kemungkinan menyalin dari ${fileB.name}`;
  const dateA = fileA.metadata.created ? new Date(fileA.metadata.created).getTime() : 0;
  const dateB = fileB.metadata.created ? new Date(fileB.metadata.created).getTime() : 0;
  if (dateA && dateB) {
    if (dateA < dateB) return `${fileB.name} kemungkinan menyalin dari ${fileA.name}`;
    if (dateB < dateA) return `${fileA.name} kemungkinan menyalin dari ${fileB.name}`;
  }
  return "Arah tidak dapat ditentukan (dokumen serupa panjang/waktu)";
}

app.post("/api/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) return c.json({ error: "Tidak ada file yang diunggah" }, 400);
    if (files.length > MAX_FILES) return c.json({ error: `Maksimal ${MAX_FILES} file per batch` }, 400);

    const parsed: ParsedFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Ukuran melebihi 10MB`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["txt", "docx", "pdf"].includes(ext || "")) {
        errors.push(`${file.name}: Format tidak didukung`);
        continue;
      }
      try {
        const buffer = await file.arrayBuffer();
        const result = await parseFile(Buffer.from(buffer), file.name);
        parsed.push(result);
      } catch (e: any) {
        errors.push(`${file.name}: ${e.message}`);
      }
    }

    state.files = [...state.files, ...parsed];
    return c.json({ message: `Berhasil memproses ${parsed.length} file`, uploaded: parsed.length, errors, fileIds: parsed.map((f) => f.id) });
  } catch (e: any) {
    return c.json({ error: `Gagal mengunggah: ${e.message}` }, 500);
  }
});

app.post("/api/analyze", (c) => {
  if (state.files.length < 2) return c.json({ error: "Minimal 2 file untuk analisis" }, 400);
  const courseName = c.req.query("course") || "";
  const exclusions = state.settings.courseExclusions[courseName] || [];
  state.results = analyzeSimilarity(state.files, exclusions);
  return c.json({ message: "Analisis selesai", totalPairs: state.results.length, results: state.results });
});

app.get("/api/results", (c) => {
  const threshold = parseFloat(c.req.query("threshold") || "0");
  let filtered = state.results;
  if (threshold > 0) filtered = state.results.filter((r) => r.normalScore >= threshold);
  return c.json({ files: state.files, results: filtered, settings: state.settings });
});

app.get("/api/ranking", (c) => {
  return c.json({ ranking: getFileRanking(state.files, state.results) });
});

app.get("/api/graph", (c) => {
  const threshold = parseFloat(c.req.query("threshold") || String(state.settings.thresholdWarning));
  const nodes = state.files.map((f, i) => {
    const angle = (2 * Math.PI * i) / state.files.length;
    const radius = 200;
    return {
      id: f.id,
      name: f.name.length > 20 ? f.name.slice(0, 20) + "..." : f.name,
      fullName: f.name,
      x: 400 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle),
    };
  });
  const edges = state.results
    .filter((r) => r.normalScore >= threshold)
    .map((r) => ({
      source: r.fileAId,
      target: r.fileBId,
      score: r.normalScore,
      label: `${r.normalScore}%`,
    }));
  return c.json({ nodes, edges });
});

app.get("/api/pair/:idA/:idB", (c) => {
  const { idA, idB } = c.req.param();
  const fileA = state.files.find((f) => f.id === idA);
  const fileB = state.files.find((f) => f.id === idB);
  if (!fileA || !fileB) return c.json({ error: "File tidak ditemukan" }, 404);

  const pairResult = state.results.find((r) => (r.fileAId === idA && r.fileBId === idB) || (r.fileAId === idB && r.fileBId === idA));
  const direction = detectDirection(fileA, fileB, pairResult);

  return c.json({
    fileA: { ...fileA, metadataStatus: checkMetadataSuspicion(fileA.metadata).status, metadataReason: checkMetadataSuspicion(fileA.metadata).reason },
    fileB: { ...fileB, metadataStatus: checkMetadataSuspicion(fileB.metadata).status, metadataReason: checkMetadataSuspicion(fileB.metadata).reason },
    similarity: pairResult || { normalScore: 0, strictScore: 0, wordOverlap: 0, matchedRanges: [] },
    direction,
  });
});

function drawTable(doc: any, headers: string[], rows: string[][], x: number, y: number, colWidths: number[], rowHeight: number) {
  const headerBg = "#181715";
  const headerText = "#faf9f5";
  const rowBg = ["#faf9f5", "#f5f0e8"];
  const borderColor = "#e6dfd8";
  const textColor = "#141413";

  doc.fillColor(headerBg).rect(x, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
  headers.forEach((h, i) => {
    const colX = colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.fillColor(headerText).fontSize(7).font("Helvetica-Bold").text(h, x + colX + 4, y + 4, { width: colWidths[i] - 8, align: "left" });
  });

  rows.forEach((row, ri) => {
    const rowY = y + rowHeight + ri * rowHeight;
    doc.fillColor(rowBg[ri % 2]).rect(x, rowY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
    row.forEach((cell, ci) => {
      const colX = colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
      doc.fillColor(textColor).fontSize(7).font("Helvetica").text(cell, x + colX + 4, rowY + 4, { width: colWidths[ci] - 8, align: "left" });
    });
  });

  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const totalHeight = rowHeight * (rows.length + 1);
  doc.strokeColor(borderColor).lineWidth(0.5);
  for (let i = 0; i <= rows.length; i++) {
    const lineY = y + i * rowHeight;
    doc.moveTo(x, lineY).lineTo(x + totalWidth, lineY).stroke();
  }
  let accX = x;
  for (const w of colWidths) {
    doc.moveTo(accX, y).lineTo(accX, y + totalHeight).stroke();
    accX += w;
  }
  doc.moveTo(x + totalWidth, y).lineTo(x + totalWidth, y + totalHeight).stroke();
}

app.get("/api/export/pdf", async (c) => {
  if (state.results.length === 0) return c.json({ error: "Belum ada hasil analisis" }, 400);

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const threshold = state.settings.thresholdDanger;
  const warning = state.settings.thresholdWarning;
  const totalFiles = state.files.length;
  const totalPairs = state.results.length;
  const highRisk = state.results.filter((r) => r.normalScore >= threshold).length;
  const mediumRisk = state.results.filter((r) => r.normalScore >= warning && r.normalScore < threshold).length;
  const safe = state.results.filter((r) => r.normalScore < warning).length;
  const avgScore = totalPairs > 0 ? Math.round((state.results.reduce((s, r) => s + r.normalScore, 0) / totalPairs) * 100) / 100 : 0;

  doc.fontSize(18).font("Helvetica-Bold").text("Laporan Analisis Plagiarisme", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica").fillColor("#6c6a64").text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, { align: "center" });
  doc.moveDown(1);

  doc.fontSize(12).font("Helvetica-Bold").fillColor("#141413").text("Summary Analisis");
  doc.moveDown(0.3);

  const summaryHeaders = ["Total File", "Total Pasangan", "Rata-rata", "Risiko Tinggi", "Risiko Sedang", "Aman"];
  const summaryRows = [[String(totalFiles), String(totalPairs), `${avgScore}%`, String(highRisk), String(mediumRisk), String(safe)]];
  const summaryWidths = [80, 90, 80, 90, 90, 70];
  drawTable(doc, summaryHeaders, summaryRows, 30, doc.y, summaryWidths, 22);
  doc.moveDown(1.5);

  doc.fontSize(12).font("Helvetica-Bold").fillColor("#141413").text("Ranking per File");
  doc.moveDown(0.3);

  const ranking = getFileRanking(state.files, state.results);
  const rankHeaders = ["#", "File", "Status", "Similarity", "Rata-rata", "Metadata", "Last Modified By"];
  const rankRows = ranking.map((f, i) => {
    const status = f.maxSimilarity >= threshold ? "TINGGI" : f.maxSimilarity >= warning ? "SEDANG" : "AMAN";
    const meta = f.metadataStatus === "Mencurigakan" ? "Mencurigakan" : "Aman";
    return [String(i + 1), f.name.length > 25 ? f.name.slice(0, 25) + "..." : f.name, status, `${f.maxSimilarity}%`, `${f.avgSimilarity}%`, meta, f.lastModifiedBy.length > 20 ? f.lastModifiedBy.slice(0, 20) + "..." : f.lastModifiedBy];
  });
  const rankWidths = [25, 140, 70, 65, 65, 80, 105];
  drawTable(doc, rankHeaders, rankRows, 30, doc.y, rankWidths, 20);
  doc.moveDown(1.5);

  doc.fontSize(12).font("Helvetica-Bold").fillColor("#141413").text("Detail Pasangan");
  doc.moveDown(0.3);

  const pairHeaders = ["#", "File A", "File B", "Normal", "Strict", "Overlap", "Status"];
  const pairRows = state.results.map((r, i) => {
    const status = r.normalScore >= threshold ? "TINGGI" : r.normalScore >= warning ? "SEDANG" : "AMAN";
    return [
      String(i + 1),
      r.fileAName.length > 18 ? r.fileAName.slice(0, 18) + "..." : r.fileAName,
      r.fileBName.length > 18 ? r.fileBName.slice(0, 18) + "..." : r.fileBName,
      `${r.normalScore}%`,
      `${r.strictScore}%`,
      `${r.wordOverlap}%`,
      status,
    ];
  });
  const pairWidths = [25, 120, 120, 55, 55, 55, 60];
  drawTable(doc, pairHeaders, pairRows, 30, doc.y, pairWidths, 20);

  doc.end();

  const pdfBuffer = await pdfPromise;
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="laporan-plagiarisme.pdf"',
    },
  });
});

app.post("/api/reset", (c) => {
  state.files = [];
  state.results = [];
  return c.json({ message: "Data berhasil direset" });
});

app.get("/api/settings", (c) => {
  return c.json(state.settings);
});

app.put("/api/settings", async (c) => {
  const body = await c.req.json();
  state.settings = { ...state.settings, ...body };
  return c.json({ message: "Pengaturan diperbarui", settings: state.settings });
});

app.post("/api/settings/exclusions", async (c) => {
  const body = await c.req.json();
  const { course, words } = body;
  if (!course || !words) return c.json({ error: "Course dan words wajib diisi" }, 400);
  state.settings.courseExclusions[course] = words;
  return c.json({ message: "Pengecualian diperbarui", exclusions: state.settings.courseExclusions });
});

app.get("/", (c) => {
  return c.json({ name: "Plagiarism Checker API", version: "1.0.0", status: "running" });
});

const port = parseInt(Bun.env.BACKEND_PORT || Bun.env.PORT || "3002");
console.log(`Server berjalan di http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
