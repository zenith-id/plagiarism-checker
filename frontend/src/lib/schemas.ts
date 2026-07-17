import { z } from "zod";

export const uploadSchema = z.object({
  files: z
    .array(z.custom<File>())
    .min(2, "Minimal 2 file untuk analisis")
    .max(200, "Maksimal 200 file per batch")
    .refine((files) => {
      const maxSize = 10 * 1024 * 1024;
      const validExts = [".txt", ".docx", ".pdf"];
      for (const file of files) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!validExts.includes(ext)) return false;
        if (file.size > maxSize) return false;
      }
      return true;
    }, "Format file tidak didukung atau ukuran melebihi 10MB"),
  courseName: z.string().max(100).optional(),
});

export const settingsSchema = z.object({
  thresholdSafe: z.number().min(0).max(100),
  thresholdWarning: z.number().min(0).max(100),
  thresholdDanger: z.number().min(0).max(100),
  courseExclusions: z.record(z.string(), z.array(z.string())),
});

export const exclusionSchema = z.object({
  course: z.string().min(1, "Nama mata kuliah wajib diisi"),
  words: z.array(z.string().min(1)).min(1, "Minimal 1 kata pengecualian"),
});

export type UploadInput = z.infer<typeof uploadSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ExclusionInput = z.infer<typeof exclusionSchema>;
