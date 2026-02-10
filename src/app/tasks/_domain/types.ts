import { z } from "zod";
import { TaskSchema, TasksResponseSchema, CloseTaskSchema } from "./schemas";

export type TaskType = z.infer<typeof TaskSchema>;
export type TasksResponseType = z.infer<typeof TasksResponseSchema>;
export type CloseTaskType = z.infer<typeof CloseTaskSchema>;

export type TaskFilterType = {
  username?: string;
  state?: string;
  department?: string;
  isCompleted?: boolean;
} | undefined;
