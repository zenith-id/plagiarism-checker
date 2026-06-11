import PDFDocument from "pdfkit";
import { AppError } from "../../shared/errors/AppError";
import { getFileRanking } from "../analysis/analysis.service";
import { getReportState } from "./reports.repository";
import type { ReportSummary } from "./reports.types";

function drawTable(doc: any, headers: string[], rows: string[][], x: number, y: number, colWidths: number[], rowHeight: number) {
  const headerBg = "#181715";
  const headerText = "#faf9f5";
  const rowBg = ["#faf9f5", "#f5f0e8"];
  const borderColor = "#e6dfd8";
  const textColor = "#141413";

  doc.fillColor(headerBg).rect(x, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
  headers.forEach((header, index) => {
    const colX = colWidths.slice(0, index).reduce((a, b) => a + b, 0);
    doc.fillColor(headerText).fontSize(7).font("Helvetica-Bold").text(header, x + colX + 4, y + 4, {
      width: colWidths[index] - 8,
      align: "left",
    });
  });

  rows.forEach((row, rowIndex) => {
    const rowY = y + rowHeight + rowIndex * rowHeight;
    doc.fillColor(rowBg[rowIndex % 2]).rect(x, rowY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill();

    row.forEach((cell, cellIndex) => {
      const colX = colWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0);
      doc.fillColor(textColor).fontSize(7).font("Helvetica").text(cell, x + colX + 4, rowY + 4, {
        width: colWidths[cellIndex] - 8,
        align: "left",
      });
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
  for (const width of colWidths) {
    doc.moveTo(accX, y).lineTo(accX, y + totalHeight).stroke();
    accX += width;
  }

  doc.moveTo(x + totalWidth, y).lineTo(x + totalWidth, y + totalHeight).stroke();
}

export async function generateAnalysisPdf(): Promise<Buffer> {
  const { files, results, settings } = getReportState();
  if (results.length === 0) throw new AppError("Belum ada hasil analisis", 400);

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const summary: ReportSummary = {
    threshold: settings.thresholdDanger,
    warning: settings.thresholdWarning,
    totalFiles: files.length,
    totalPairs: results.length,
    highRisk: results.filter((result) => result.normalScore >= settings.thresholdDanger).length,
    mediumRisk: results.filter((result) => result.normalScore >= settings.thresholdWarning && result.normalScore < settings.thresholdDanger).length,
    safe: results.filter((result) => result.normalScore < settings.thresholdWarning).length,
    avgScore: results.length > 0 ? Math.round((results.reduce((sum, result) => sum + result.normalScore, 0) / results.length) * 100) / 100 : 0,
  };

  doc.fontSize(18).font("Helvetica-Bold").text("Laporan Analisis Plagiarisme", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica").fillColor("#6c6a64").text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, { align: "center" });
  doc.moveDown(1);

  doc.fontSize(12).font("Helvetica-Bold").fillColor("#141413").text("Summary Analisis");
  doc.moveDown(0.3);

  drawTable(
    doc,
    ["Total File", "Total Pasangan", "Rata-rata", "Risiko Tinggi", "Risiko Sedang", "Aman"],
    [[String(summary.totalFiles), String(summary.totalPairs), `${summary.avgScore}%`, String(summary.highRisk), String(summary.mediumRisk), String(summary.safe)]],
    30,
    doc.y,
    [80, 90, 80, 90, 90, 70],
    22,
  );
  doc.moveDown(1.5);

  doc.fontSize(12).font("Helvetica-Bold").fillColor("#141413").text("Ranking per File");
  doc.moveDown(0.3);

  const ranking = getFileRanking(files, results);
  const rankRows = ranking.map((file, index) => {
    const status = file.maxSimilarity >= summary.threshold ? "TINGGI" : file.maxSimilarity >= summary.warning ? "SEDANG" : "AMAN";
    const metadata = file.metadataStatus === "Mencurigakan" ? "Mencurigakan" : "Aman";

    return [
      String(index + 1),
      file.name.length > 25 ? `${file.name.slice(0, 25)}...` : file.name,
      status,
      `${file.maxSimilarity}%`,
      `${file.avgSimilarity}%`,
      metadata,
      file.lastModifiedBy.length > 20 ? `${file.lastModifiedBy.slice(0, 20)}...` : file.lastModifiedBy,
    ];
  });

  drawTable(
    doc,
    ["#", "File", "Status", "Similarity", "Rata-rata", "Metadata", "Last Modified By"],
    rankRows,
    30,
    doc.y,
    [25, 140, 70, 65, 65, 80, 105],
    20,
  );
  doc.moveDown(1.5);

  doc.fontSize(12).font("Helvetica-Bold").fillColor("#141413").text("Detail Pasangan");
  doc.moveDown(0.3);

  const pairRows = results.map((result, index) => {
    const status = result.normalScore >= summary.threshold ? "TINGGI" : result.normalScore >= summary.warning ? "SEDANG" : "AMAN";
    return [
      String(index + 1),
      result.fileAName.length > 18 ? `${result.fileAName.slice(0, 18)}...` : result.fileAName,
      result.fileBName.length > 18 ? `${result.fileBName.slice(0, 18)}...` : result.fileBName,
      `${result.normalScore}%`,
      `${result.strictScore}%`,
      `${result.wordOverlap}%`,
      status,
    ];
  });

  drawTable(doc, ["#", "File A", "File B", "Normal", "Strict", "Overlap", "Status"], pairRows, 30, doc.y, [25, 120, 120, 55, 55, 55, 60], 20);

  doc.end();
  return pdfPromise;
}
