import { z } from "zod";
import { FodaItemSchema, FodaResponseSchema, DeleteMemberSchema } from "./schemas";

export type FodaItem = z.infer<typeof FodaItemSchema>;
export type FodaResponse = z.infer<typeof FodaResponseSchema>;
export type DeleteMember = z.infer<typeof DeleteMemberSchema>;

export type MemberAdd = { service?: string; state?: string };
export type MemberAddPayload = { query: MemberAdd; body: { title: string; description: string } };
