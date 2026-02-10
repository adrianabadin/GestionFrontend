import { z } from "zod";
import { LoginSchema, SignUpSchema, ChangePasswordSchema } from "./schemas";

export type LoginType = z.infer<typeof LoginSchema>;
export type SignUpType = z.infer<typeof SignUpSchema>;
export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;

export type Department = {
  name: string;
  id: string;
};

export type DepartmentUser = {
  Departments: Department;
};

export type AuthResponseType = Omit<SignUpType, "password2" | "password"> & {
  id: string;
  DepartmentUsers: DepartmentUser[];
  responsibleFor: Department[];
};
