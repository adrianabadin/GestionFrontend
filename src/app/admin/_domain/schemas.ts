import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().email(),
  name: z.string(),
  lastname: z.string(),
  isAdmin: z.boolean(),
  Departments: z.array(z.object({
    id: z.string(),
    name: z.string()
  }))
});
