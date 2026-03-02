import { z } from "zod";

// Enums (coinciden con el backend)
export const GanttItemTypeEnum = z.enum(["task", "milestone", "summary"]);
export const GanttPriorityEnum = z.enum(["low", "medium", "high", "critical"]);
export const GanttStatusEnum = z.enum(["planning", "active", "onhold", "completed", "cancelled"]);

// Helper: Convierte string vacío en undefined
const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

// Helper: Convierte fecha YYYY-MM-DD a ISO datetime
const dateToDatetime = z
  .string()
  .optional()
  .transform((val) => {
    if (!val || val === "") return undefined;
    // Si ya es datetime ISO, dejarlo como está
    if (val.includes("T")) return val;
    // Si es solo fecha (YYYY-MM-DD), agregar hora
    return `${val}T00:00:00.000Z`;
  });

// Schema base sin validaciones complejas
const GanttItemBaseSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título no puede exceder 200 caracteres"),
  description: z.string().max(2000, "La descripción no puede exceder 2000 caracteres").optional(),
  type: GanttItemTypeEnum.default("task"),
  startDate: dateToDatetime,
  endDate: dateToDatetime,
  progress: z.number().min(0).max(100).default(0),
  priority: GanttPriorityEnum.default("medium"),
  status: GanttStatusEnum.default("planning"),
  sortOrder: z.number().int().default(0),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "El color debe estar en formato hexadecimal").optional(),
  // Relaciones opcionales
  departmentsId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
  demographyId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
  assignedToId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
  parentId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
  // createdById requerido
  createdById: z.string().uuid()
});

// Schema para crear GanttItem (con validación de fechas)
export const CreateGanttItemSchema = GanttItemBaseSchema.refine(
  (data) => {
    // Si hay fechas, validar que endDate >= startDate
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  { message: "La fecha de fin debe ser posterior o igual a la fecha de inicio" }
);

// Schema para actualizar GanttItem (partial del base, sin la validación de fechas por ahora)
export const UpdateGanttItemSchema = GanttItemBaseSchema.partial();

// Schema para respuesta del backend
export const GanttItemResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  type: GanttItemTypeEnum,
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  progress: z.number().min(0).max(100),
  priority: GanttPriorityEnum,
  status: GanttStatusEnum,
  sortOrder: z.number().int(),
  estimatedHours: z.number().nullable(),
  actualHours: z.number().nullable(),
  color: z.string().nullable(),
  parentId: z.string().uuid().nullable(),
  path: z.string(),
  depth: z.number().min(0),
  assignedToId: z.string().uuid().nullable(),
  createdById: z.string().uuid(),
  departmentsId: z.string().uuid().nullable(),
  demographyId: z.string().uuid().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Relaciones populadas (opcional)
  AssignedTo: z.object({
    id: z.string().uuid(),
    name: z.string(),
    lastname: z.string(),
    username: z.string()
  }).optional().nullable(),
  CreatedBy: z.object({
    id: z.string().uuid(),
    name: z.string(),
    lastname: z.string()
  }).optional().nullable(),
  Parent: z.object({
    id: z.string().uuid(),
    title: z.string()
  }).optional().nullable(),
  Departments: z.object({
    id: z.string().uuid(),
    name: z.string()
  }).optional().nullable(),
  Demography: z.object({
    id: z.string().uuid(),
    state: z.string()
  }).optional().nullable()
});

// Schema para filtros de query (coincide con backend)
export const GanttQueryFiltersSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(), // Se mapea a "pageSize" en el API
  includeInactive: z.boolean().optional(), // Se mapea a "isActive" en el API
  assignedToId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  departmentsId: z.string().uuid().optional(),
  demographyId: z.string().uuid().optional(),
  status: GanttStatusEnum.optional(),
  priority: GanttPriorityEnum.optional(),
  type: GanttItemTypeEnum.optional()
});

// Schema para respuesta de lista paginada (coincide con backend)
export const GanttListResponseSchema = z.object({
  data: z.array(GanttItemResponseSchema), // ✅ Backend retorna "data" (no "items")
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(), // ✅ Backend usa "pageSize" (también acepta "limit" por compatibilidad)
    total: z.number(),
    totalPages: z.number()
  })
});

// Types exportados
export type GanttItemType = z.infer<typeof GanttItemTypeEnum>;
export type CreateGanttItemType = z.infer<typeof CreateGanttItemSchema>;
export type UpdateGanttItemType = z.infer<typeof UpdateGanttItemSchema>;
export type GanttItemResponse = z.infer<typeof GanttItemResponseSchema>;
export type GanttQueryFilters = z.infer<typeof GanttQueryFiltersSchema>;
export type GanttListResponse = z.infer<typeof GanttListResponseSchema>;
