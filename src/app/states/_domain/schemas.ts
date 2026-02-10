import { z } from "zod";

export const StatesSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  state: z.string().min(3, { message: "El partido debe tener al menos 3 caracteres" }),
  population: z.number(),
  description: z.string().min(3, { message: "La descripcion debe tener al menos 3 caracteres" }),
  politics: z.string().min(3, { message: "El partido politico debe tener al menos 3 letras" })
});
