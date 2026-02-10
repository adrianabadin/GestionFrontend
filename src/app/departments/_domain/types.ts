import { z } from "zod";
import { DepartmentCreateSchema, DepartmentAssignSchema } from "./schemas";

export type DepartmentResponseType = z.infer<typeof DepartmentCreateSchema>;
export type DepartmentAssignType = z.infer<typeof DepartmentAssignSchema>;

export type DepartmentType = {
  id: string;
  name: string;
  description?: string;
};
