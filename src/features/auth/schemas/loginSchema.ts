import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no minio 6 caracteres" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
