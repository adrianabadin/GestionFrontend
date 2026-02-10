import { z } from "zod";

export const DepartmentCreateSchema = z.object({
  id: z.string().uuid({ message: "ID debe ser un UUID" }),
  name: z.string().min(3, { message: "El nombre debe tener 3 caracteres" }),
  description: z.string().min(3, { message: "La descripcion debe tener 3 caracteres" })
});

export const DepartmentAssignSchema = z.object({
  userId: z.string().uuid(),
  departmentNames: z.array(z.string())
});
