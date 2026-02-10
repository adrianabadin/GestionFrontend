import { z } from "zod";
import {
  CreatedKOISchema,
  FilesDescriptor,
  UserIssueSchema,
  InterventionSchema,
  MailSchema,
  DerivationSchema,
  GcImageItemSchema,
  GetInterventionSchema,
  GetIssueWithInterventionSchema
} from "./schemas";

export type CreatedKOI = z.infer<typeof CreatedKOISchema>;
export type FileDescriptor = z.infer<typeof FilesDescriptor>;
export type UserIssue = z.infer<typeof UserIssueSchema>;
export type Intervention = z.infer<typeof InterventionSchema>;
export type Mail = z.infer<typeof MailSchema>;
export type DerivationType = z.infer<typeof DerivationSchema>;
export type GcImageItem = z.infer<typeof GcImageItemSchema>;
export type GetInterventions = z.infer<typeof GetInterventionSchema>;
export type GetIssueWithInterventions = z.infer<typeof GetIssueWithInterventionSchema>;

export type GetIssues = {
  id: string;
  createdAt: Date;
  email: string;
  email2: string;
  name: string;
  lastName: string;
  socialSecurityNumber: string;
  phone: string;
  phone2: string;
  description: string;
  files: Array<{ driveId: string; name: string; id: string; description: string }>;
  kind: { name: string };
  state: { state: string };
  department: string;
};
