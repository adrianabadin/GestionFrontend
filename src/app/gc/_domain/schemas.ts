import { z } from "zod";

// Kind of Issue (Tipo de Solicitud)
export const CreatedKOISchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  text: z.string()
});

// Files
export const FilesDescriptor = z.object({
  driveId: z.string({ required_error: "El campo es obligatorio" }),
  name: z.string({ required_error: "El campo es obligatorio" })
    .min(3, "El nombre del archivo debe tener al menos 3 letras"),
  description: z.string({ required_error: "El campo es obligatorio" })
    .min(3, { message: "La descripcion del archivo debe contener al menos 3 caracteres" })
});

// User Issue (Solicitud)
export const UserIssueSchema = z.object({
  email: z.string().optional().refine(
    (value) => {
      if (value === undefined || value === "") return true;
      const prueba = z.string().email();
      const response = prueba.safeParse(value);
      return response.success;
    },
    { message: "Debes proveer un email valido o nada" }
  ),
  name: z.string({ required_error: "El campo es obligatorio" })
    .min(3, { message: "El nombre debe tener al menos 3 letras" }),
  lastName: z.string({ required_error: "El campo es obligatorio" })
    .min(3, { message: "El apellido debe tener al menos 3 letras" }),
  socialSecurityNumber: z.string({ required_error: "El campo es obligatorio" })
    .regex(/^[0-9]{7,8}$/, {
      message: "El DNI debe contar con 7 a 8 caracteres numericos sin simbolos especiales"
    }),
  phone: z.string().optional().refine(
    (value) => {
      if (value === undefined || value === "") return true;
      if (value.length < 10) return false;
      let bool: boolean = true;
      value.split("").forEach((character) => {
        if (Number.isNaN(parseInt(character))) bool = false;
      });
      return bool;
    },
    { message: "Deben ser 10 digitos o ningun valor" }
  ),
  healthInsurance: z.string({ invalid_type_error: "Debe ser una cadena" }).optional(),
  state: z.string({ required_error: "El campo es obligatorio" })
    .min(3, { message: "El partido debe contener al menos 3 caracteres" }),
  kind: z.string({ required_error: "El campo es obligatorio" })
    .min(3, { message: "El tipo de solicitud debe contener al menos 3 caracteres" }),
  department: z.string({ required_error: "El campo es obligatorio" }),
  description: z.string({ required_error: "El campo es obligatorio" })
    .min(10, { message: "La descripcion debe tener al menos 10 caracteres" }),
  files: z.array(FilesDescriptor).optional()
});

// Intervention
export const InterventionSchema = z.object({
  id: z.string({ required_error: "Debes proveer el id de la gestion" }),
  description: z.string({ required_error: "Debes proveer una descripcion" })
    .min(10, { message: "La descripcion de tu intervencion debe tener al menos 10 letras" }),
  files: z.array(FilesDescriptor).optional(),
  userId: z.string({ required_error: "Debes proveer un id de usuario" })
});

// Mail
export const MailSchema = z.object({
  to: z.string().email({ message: "Debes proveer un mail de destino valido" }),
  autor: z.string({ required_error: "Debes proveer un nombre de remitente" }),
  nombre: z.string({ required_error: "Debes proveer un nombre de destinatario" }),
  body: z.string({ required_error: "Debes proveer el cuerpo del mensaje" })
});

// Derivation
export const DerivationSchema = z.object({
  issueId: z.string({ required_error: "Debes enviar un issueId" }),
  userIssue: z.string({ required_error: "Debes enviar un userIssue" }).optional(),
  departmentId: z.string({ required_error: "Debes enviar un departmentId" }).optional()
}).refine(
  (data) => {
    if (data.userIssue === undefined && data.departmentId === undefined) return false;
    return true;
  },
  { message: "Debes enviar un userIssue o un departmentId", path: ["body"] }
);

// GC Images
export const GcImageItemSchema = z.object({
  description: z.string().min(3, { message: "La descripcion de la imagen debe ser de al menos 3 caracteres" }),
  link: z.string().url({ message: "Debe ser un link valido" })
});

// Interventions schema for responses
export const GetInterventionSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.date(),
  user: z.object({
    username: z.string().email(),
    name: z.string(),
    lastname: z.string()
  }),
  files: z.array(z.object({
    driveId: z.string(),
    description: z.string(),
    name: z.string()
  }))
});

export const GetIssueWithInterventionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  interventions: z.array(GetInterventionSchema)
});
