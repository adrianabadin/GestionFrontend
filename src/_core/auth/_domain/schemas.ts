import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().email({ message: "Debes proveer un email valido" }),
  password: z.string().min(6, { message: "La contraseña debe contener al menos 6 caracteres" })
});

export const SignUpSchema = z.object({
  username: z.string().email({ message: "Debes proveer un email valido" }),
  password: z.string().min(6, { message: "La contraseña debe contener al menos 6 caracteres" }),
  password2: z.string().min(6, { message: "La contraseña debe contener al menos 6 caracteres" }),
  name: z.string().min(3, { message: "El nombre debe contener al menos 3 caracteres" }),
  lastname: z.string().min(3, { message: "El apellido debe contener al menos 3 caracteres" }),
  isAdmin: z.boolean({ invalid_type_error: "isAdmin debe ser un boolean" }).optional(),
  Departments: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).optional()
}).refine((value) => value.password === value.password2, {
  message: "Ambas contraseñas deben coincidir",
  path: ["password2"]
});

export const ChangePasswordSchema = z.object({
  username: z.string().email({ message: "Debes enviar un mail valido" }),
  password: z.string().min(6, "La clave debe tener al menos 6 caracteres"),
  token: z.string()
});
