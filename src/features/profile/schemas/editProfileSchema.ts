import { z } from "zod";

const AVAILABLE_CATEGORIES = [
  "FullStack",
  "Front",
  "Mobile",
  "Back",
  "DevOps",
  "Data",
] as const;

export const editProfileSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.email(),
  password: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

export { AVAILABLE_CATEGORIES };
