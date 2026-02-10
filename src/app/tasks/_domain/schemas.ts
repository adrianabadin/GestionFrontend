import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(3),
  flag: z.enum(["red", "yellow", "green"]),
  date: z.string(),
  department: z.string().min(3),
  username: z.string().email(),
  state: z.string().min(3)
});

export const TasksResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().min(3),
  title: z.string().min(1),
  date: z.string().transform((stringValue) => new Date(stringValue)),
  flag: z.enum(["red", "green", "yellow"]),
  Departments: z.object({
    name: z.string().min(3),
  }),
  Demography: z.object({
    state: z.string().min(3),
  }),
  Users: z.object({
    username: z.string().min(3),
  }),
  brief: z.string().min(3).optional(),
  file: z.string().url().optional()
});

export const CloseTaskSchema = z.object({
  id: z.string().uuid(),
  brief: z.string().min(3),
  file: z.string().url().optional()
});
