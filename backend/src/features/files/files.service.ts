import { AppError } from "../../shared/errors/AppError";
import { MAX_FILE_SIZE, MAX_FILES } from "../../shared/state/app-state";
import { successResponse } from "../../shared/utils/response";
import { appendFiles, clearStoredFiles } from "./files.repository";
import { parseFile, type ParsedFile } from "./files.parser";
import type { UploadFilesResult } from "./files.types";

const ALLOWED_EXTENSIONS = ["txt", "docx", "pdf"];

export async function uploadFiles(files: File[]) {
  if (!files.length) throw new AppError("Tidak ada file yang diunggah", 400);
  if (files.length > MAX_FILES) throw new AppError(`Maksimal ${MAX_FILES} file per batch`, 400);

  const parsed: ParsedFile[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: Ukuran melebihi 10MB`);
      continue;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext || "")) {
      errors.push(`${file.name}: Format tidak didukung`);
      continue;
    }

    try {
      const buffer = await file.arrayBuffer();
      parsed.push(await parseFile(Buffer.from(buffer), file.name));
    } catch (error: any) {
      errors.push(`${file.name}: ${error.message}`);
    }
  }

  appendFiles(parsed);

  const result: UploadFilesResult = {
    uploaded: parsed.length,
    errors,
    fileIds: parsed.map((file) => file.id),
  };

  return successResponse(`Berhasil memproses ${parsed.length} file`, result);
}

export function resetFiles() {
  clearStoredFiles();
  return successResponse("Data berhasil direset");
}
