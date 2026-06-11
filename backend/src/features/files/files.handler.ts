import type { Context } from "hono";
import { AppError } from "../../shared/errors/AppError";
import { uploadFileSchema } from "./files.schema";
import { resetFiles, uploadFiles } from "./files.service";

export async function uploadFilesHandler(c: Context) {
  const formData = await c.req.formData();
  const files = formData.getAll("files") as File[];

  files.forEach((file) => {
    const parsed = uploadFileSchema.safeParse({ name: file.name, size: file.size });
    if (!parsed.success) {
      throw new AppError("Metadata file tidak valid", 400, parsed.error.flatten());
    }
  });

  return c.json(await uploadFiles(files));
}

export function resetFilesHandler(c: Context) {
  return c.json(resetFiles());
}
