import { z } from "zod";

export const FodaItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, { message: "Title must have at least 3 leters" }),
  description: z.string().min(3, { message: "Description must have at least 3 leters" })
});

export const FodaResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  demographyId: z.string().uuid(),
  Menace: z.array(FodaItemSchema).optional(),
  Strength: z.array(FodaItemSchema).optional(),
  Weakness: z.array(FodaItemSchema).optional(),
  Oportunity: z.array(FodaItemSchema).optional(),
  StrategySO: z.array(FodaItemSchema).optional(),
  StrategySM: z.array(FodaItemSchema).optional(),
  StrategyWO: z.array(FodaItemSchema).optional(),
  StrategyWM: z.array(FodaItemSchema).optional()
});

export const DeleteMemberSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
  title: z.string(),
  description: z.string(),
  fODAId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});
