import type { Context } from "hono";
import { exportPdfSchema } from "./export.schema";
import { generateAnalysisPdf } from "./export.service";

export async function exportPdfHandler(_c: Context) {
  exportPdfSchema.parse({});
  const pdfBuffer = await generateAnalysisPdf();
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="laporan-plagiarisme.pdf"',
    },
  });
}
