import { z } from "zod";

export const uploadFileSchema = z.object({
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
});
