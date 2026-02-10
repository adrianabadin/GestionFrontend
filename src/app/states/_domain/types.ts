import { z } from "zod";
import { StatesSchema } from "./schemas";

export type StatesType = z.infer<typeof StatesSchema>;

export type DemografyCreateType = {
  state: string;
  population: number;
  description: string;
  politics: string;
};
